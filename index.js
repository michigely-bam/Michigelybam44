import path from "path";
import fs from "fs";
import config from "./config.js";
import { startConnection } from "./src/connection.js";
import {
  messageHandler,
  groupHandler,
  messageUpdateHandler,
  groupSettingsHandler,
  handleAntiRemoveFromUpsert,
} from "./src/handler.js";
import { loadPlugins, pluginStore } from "./src/lib/ourin-plugins.js";
import { initDatabase, getDatabase } from "./src/lib/ourin-database.js";
import {
  initScheduler,
  loadScheduledMessages,
  startGroupScheduleChecker,
  startSewaChecker,
} from "./src/lib/ourin-scheduler.js";
import { handleAntiTagSW } from "./src/lib/ourin-group-protection.js";
import { initSholatScheduler } from "./src/lib/ourin-sholat-scheduler.js";
import { initNotifScheduler } from "./src/lib/ourin-notif-scheduler.js";
import { initAutoJpmScheduler } from "./src/lib/ourin-auto-jpm.js";
import { startMemoryMonitor } from "./src/lib/ourin-memory-monitor.js";
import { startTempCleaner } from "./src/lib/ourin-temp-cleaner.js";
import { startDailyPruner } from "./src/lib/ourin-data-pruner.js";
import {
  logger,
  c,
  playBootSequence,
  spinText,
  logConnection,
  logErrorBox,
  divider,
} from "./src/lib/ourin-logger.js";

await import("./src/lib/ourin-agent.js")
  .then((m) => m.initializeAgent())
  .catch(() => {});

let startOrderPoller;
try {
  const _mod = await import("./src/lib/ourin-order-poller.js");
  startOrderPoller = _mod.startOrderPoller;
} catch {}
let startOtpPoller;
try {
  const _mod = await import("./src/lib/ourin-otp-poller.js");
  startOtpPoller = _mod.startOtpPoller;
} catch {}

const LOG_NOISE = new Set([
  "Closing",
  "prekey",
  "_chains",
  "registrationId",
  "chainKey",
  "ephemeralKeyPair",
  "rootKey",
  "indexInfo",
  "pendingPreKey",
  "currentRatchet",
  "baseKey",
  "privKey",
]);
const _log = console.log;
console.log = (...args) => {
  const first = typeof args[0] === "string" ? args[0] : "";
  for (const noise of LOG_NOISE) {
    if (first.includes(noise)) return;
  }
  _log.apply(console, args);
};

const startTime = Date.now();

let pluginWatcher = null;
const reloadDebounce = new Map();
const fileStatCache = new Map();

function startDevWatcher(pluginsPath) {
  if (pluginWatcher) pluginWatcher.close();

  logger.system("dev", "recarga de plugins activa");

  pluginWatcher = fs.watch(
    pluginsPath,
    { recursive: true },
    (eventType, filename) => {
      if (!filename || !filename.endsWith(".js")) return;

      const existingTimeout = reloadDebounce.get(filename);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(async () => {
        reloadDebounce.delete(filename);
        const fullPath = path.join(pluginsPath, filename);

        if (!fs.existsSync(fullPath)) {
          fileStatCache.delete(fullPath);
          const pluginName = path.basename(filename, ".js");
          const { unloadPlugin } = await import("./src/lib/ourin-plugins.js");
          const result = unloadPlugin(pluginName);
          if (result.success) logger.warn("plugin", `eliminado ${filename}`);
          return;
        }

        try {
          const stats = fs.statSync(fullPath);
          const cached = fileStatCache.get(fullPath);
          const changed =
            !cached ||
            cached.mtimeMs !== stats.mtimeMs ||
            cached.size !== stats.size;
          if (!changed) return;

          fileStatCache.set(fullPath, {
            mtimeMs: stats.mtimeMs,
            size: stats.size,
          });

          const { hotReloadPlugin } =
            await import("./src/lib/ourin-plugins.js");
          const result = await hotReloadPlugin(fullPath);
          if (!result.success) {
            logger.error(
              "plugin",
              `reload fallo: ${filename}: ${result.error}`,
            );
          }
        } catch (error) {
          logger.error(
            "plugin",
            `reload fallo: ${filename}: ${error.message}`,
          );
        }
      }, 500);

      reloadDebounce.set(filename, timeout);
    },
  );

  logger.debug("dev", `vigilando ${pluginsPath}`);
}

let srcWatcher = null;

function startSrcWatcher(srcPath) {
  if (srcWatcher) srcWatcher.close();

  logger.system("dev", "recarga automática de src activa");

  srcWatcher = fs.watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    const existingTimeout = reloadDebounce.get("src_" + filename);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      reloadDebounce.delete("src_" + filename);
      const fullPath = path.join(srcPath, filename);
      if (!fs.existsSync(fullPath)) {
        logger.warn("dev", `archivo src eliminado: ${filename}`);
        return;
      }
      logger.success("dev", `src modificado: ${filename}`);
    }, 500);

    reloadDebounce.set("src_" + filename, timeout);
  });

  logger.debug("dev", `observando ${srcPath}`);
}

function setupAntiCrash() {
  process.on("uncaughtException", (error, origin) => {
    const ignoredErrors = [
      "write EOF",
      "ECONNRESET",
      "EPIPE",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
      "read ECONNRESET",
    ];
    const isIgnored = ignoredErrors.some(
      (msg) => error.message?.includes(msg) || error.code === msg,
    );
    if (isIgnored) return;

    logErrorBox("uncaught exception", error.message);
    console.error(c.gray(error.stack));
    logger.system("sistema", "bot sigue funcionando");
  });

  process.on("unhandledRejection", (reason, promise) => {
    logErrorBox("unhandled rejection", String(reason));
    console.error(c.gray("Promise:"), promise);
    logger.system("sistema", "bot sigue funcionando");
  });

  process.on("warning", (warning) => {
    logger.warn("sistema", `${warning.name}: ${warning.message}`);
  });

  process.on("SIGINT", async () => {
    console.log("");
    logger.system("sistema", "señal de detención recibida");
    logger.info("base de datos", "guardando datos...");
    try {
      const db = getDatabase();
      db.save();
      logger.success("base de datos", "datos guardados");
    } catch (error) {
      logger.warn("base de datos", `error al guardar: ${error.message}`);
    }
    logger.info("sistema", "bot detenido");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("");
    logger.system("sistema", "señal de detención recibida");
    process.exit(0);
  });

  logger.success("sistema", "anti-crash activo");
}

async function main() {
  await playBootSequence({
    name: config.bot?.name || "MIKU_NAKANO-BOT",
    version: config.bot?.version || "1.0.0",
    developer: config.bot?.developer || "Developer",
    mode: config.mode || "public",
  });
  setupAntiCrash();

  const dbPath = path.join(
    process.cwd(),
    config.database?.path || "./database/main",
  );
  await initDatabase(dbPath);
  const db = getDatabase();

  const savedMode = db.setting("botMode");
  if (savedMode && (savedMode === "self" || savedMode === "public"))
    config.mode = savedMode;
  const savedPremium = db.setting("premiumUsers");
  if (Array.isArray(savedPremium)) config.premiumUsers = savedPremium;
  const savedBanned = db.setting("bannedUsers");
  if (Array.isArray(savedBanned)) config.bannedUsers = savedBanned;

  const pCount = Array.isArray(savedPremium) ? savedPremium.length : 0;
  const bCount = Array.isArray(savedBanned) ? savedBanned.length : 0;
  logger.success(
    "database",
    `siap · mode: ${config.mode}, premium: ${pCount}, banned: ${bCount}`,
  );

  const pluginsPath = path.join(process.cwd(), "plugins");
  const pluginCount = await loadPlugins(pluginsPath);
  logger.success("plugin", `${pluginCount} plugin cargado`);

  if (config.dev?.enabled && config.dev?.watchPlugins)
    startDevWatcher(pluginsPath);
  if (config.dev?.enabled && config.dev?.watchSrc) {
    const srcPath = path.join(process.cwd(), "src");
    startSrcWatcher(srcPath);
  }

  initScheduler(config);

  const bootTime = Date.now() - startTime;
  logger.success("inicio", `listo en ${bootTime}ms`);
  divider();
  await spinText("whatsapp", "abriendo ruta de conexión", {
    duration: 900,
    tone: "accent",
  });
  logConnection("conectando", "estableciendo sesión y handshake");
  console.log("");

  await startConnection({
    onRawMessage: async (msg, sock) => {
      try {
        const db = getDatabase();
        await handleAntiTagSW(msg, sock, db);
      } catch (error) {}
    },

    onMessage: async (msg, sock) => {
      try {
        const handlerPromise = messageHandler(msg, sock);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Handler timeout")), 60000),
        );
        await Promise.race([handlerPromise, timeoutPromise]);
      } catch (error) {
        if (error.message !== "Handler timeout") {
          logger.error("HANDLER", error.message);
          if (config.dev?.debugLog) console.error(c.gray(error.stack));
        }
      }
    },

    onGroupUpdate: async (update, sock) => {
      try {
        await groupHandler(update, sock);
      } catch (error) {
        logger.error("GROUP", error.message);
      }
    },

    onMessageUpdate: async (updates, sock) => {
      try {
        await messageUpdateHandler(updates, sock);
      } catch (error) {
        logger.error("MSG", error.message);
      }
    },

    onGroupSettingsUpdate: async (update, sock) => {
      try {
        await groupSettingsHandler(update, sock);
      } catch (error) {
        logger.error("GROUP", error.message);
      }
    },

    onStubMessage: async (msg, sock) => {
      try {
        const db = getDatabase();
        await handleAntiRemoveFromUpsert(msg, sock, db);
      } catch (error) {
        logger.error("ANTIDELETE", error.message);
      }
    },

    onConnectionUpdate: async (update, sock) => {
      if (update.connection === "open") {
        logConnection("connected", sock.user?.name || "Bot");
        loadScheduledMessages(sock);
        startGroupScheduleChecker(sock);
        startSewaChecker(sock);
        initScheduler(config, sock);
        initAutoJpmScheduler(sock);
        initSholatScheduler(sock);
        initNotifScheduler(sock);
        try {
          const { initSahurCron } =
            await import("./plugins/religi/autosahur.js");
          initSahurCron(sock);
        } catch {}
        try {
          if (startOrderPoller) startOrderPoller(sock);
        } catch {}
        try {
          const { startOtpPoller: _startOtp } =
            await import("./src/lib/ourin-otp-poller.js");
          _startOtp(sock);
        } catch {}

        try {
          const { getAllJadibotSessions, restartJadibotSession } =
            await import("./src/lib/ourin-jadibot-manager.js");
          const sessions = getAllJadibotSessions();
          if (sessions.length > 0) {
            logger.info("JADIBOT", `restaurando ${sessions.length} session(s)`);
            for (const session of sessions) {
              try {
                await restartJadibotSession(sock, session.id);
                await new Promise((r) => setTimeout(r, 3000));
              } catch (e) {
                logger.error(
                  "JADIBOT",
                  `restauracion fallida ${session.id}: ${e.message}`,
                );
              }
            }
          }
        } catch (e) {
          logger.error("JADIBOT", `Error al restaurar: ${e.message}`);
        }

        const devLabel = config.dev?.enabled ? ` ${c.yellow("• dev")}` : "";
        startMemoryMonitor();
        startTempCleaner();
        startDailyPruner();
        logger.success("listo", `todos los sistemas activos${devLabel}`);
        divider();
      }
    },
  });
}

main().catch((error) => {
  logErrorBox("Fatal Error", error.message);
  console.error(c.gray(error.stack));
  process.exit(1);
});
