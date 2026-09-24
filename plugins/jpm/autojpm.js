import { getDatabase } from '../../src/lib/ourin-database.js'
import { getAutoJpmConfig, setAutoJpmConfig, startAutoJpmScheduler, stopAutoJpmScheduler, getAutoJpmStorageDir } from '../../src/lib/ourin-auto-jpm.js'
import { getMimeType, getExtension } from '../../src/lib/ourin-utils.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
  name: "autojpm",
  alias: ["autojasher", "autojaserm", "autojasabroadcast"],
  category: "jpm",
  description: "Programar JPM automático con intervalo y medios",
  usage: ".autojpm en el intervalo de instrucciones",
  example: ".autojpm on 1h ¡Hola a todos!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseInterval(raw) {
  if (!raw) return 0;
  const cleaned = raw.toLowerCase().replace(/\s+/g, "");
  const matches = [...cleaned.matchAll(/(\d+)([smhdw])/g)];
  if (!matches.length) return 0;
  const combined = matches.map((match) => match[0]).join("");
  if (combined !== cleaned) return 0;
  let total = 0;
  for (const match of matches) {
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === "s") total += value * 1000;
    if (unit === "m") total += value * 60 * 1000;
    if (unit === "h") total += value * 60 * 60 * 1000;
    if (unit === "d") total += value * 24 * 60 * 60 * 1000;
    if (unit === "w") total += value * 7 * 24 * 60 * 60 * 1000;
  }
  return total;
}

function formatInterval(ms) {
  if (!ms || ms <= 0) return "0 segundos";
  const units = [
    { label: "días", value: 24 * 60 * 60 * 1000 },
    { label: "horas", value: 60 * 60 * 1000 },
    { label: "minutos", value: 60 * 1000 },
    { label: "segundos", value: 1000 },
  ];
  let remaining = ms;
  const parts = [];
  for (const unit of units) {
    const amount = Math.floor(remaining / unit.value);
    if (amount > 0) {
      parts.push(`${amount} ${unit.label}`);
      remaining -= amount * unit.value;
    }
  }
  return parts.length ? parts.join(" ") : "0 segundos";
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "-";
  return `${timeHelper.fromTimestamp(timestamp)} WIB`;
}

function previewText(text) {
  if (!text) return "-";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 80) return cleaned;
  return `${cleaned.slice(0, 77)}...`;
}

function normalizeMessageText(text) {
  if (!text) return "";
  return text.replace(/\\n/g, "\n").trim();
}

function getMediaInfo(message) {
  if (!message) return null;
  if (message.isImage) return { type: "image", mimetype: message.mimetype };
  if (message.isVideo) return { type: "video", mimetype: message.mimetype };
  if (message.isAudio) return { type: "audio", mimetype: message.mimetype };
  if (message.isDocument)
    return {
      type: "document",
      mimetype: message.mimetype,
      fileName: message.fileName || message.message?.documentMessage?.fileName,
    };
  return null;
}

function cleanupStoredMedia(mediaPath, currentPath) {
  if (!mediaPath || mediaPath === currentPath) return;
  try {
    const baseDir = getAutoJpmStorageDir();
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(mediaPath);
    if (resolvedPath.startsWith(resolvedBase) && fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }
  } catch (e) {}
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const prefix = m.prefix
  const input = (m.text || "").trim();
  if (!input) {
    const helpText =
      `📢 *JPM AUTOMÁTICO (DIFUSIÓN PROGRAMADA)*\n\n` +
      `Un sistema automático para transmitir a todo el grupo basado en intervalos de tiempo.

` +
      `*USO:*
` +
      `• *${prefix}autojpm on <intervalo> <mensaje>* — Activar la difusión programada
` +
      `• *${prefix}autojpm off* — Apagar el calendario de auto jpm
` +
      `• *${prefix}autojpm status* — Chequear el estado y el calendario de autojpm actual

` +
      `*FORMAT INTERVAL:*\n` +
      `• \`10m\` (10 minutos) | \`1h\` (1 hora)
` +
      `• \`2h30m\` (2 horas y 30 minutos) | \`1d\` (1 día)

` +
      `*EJEMPLO:*\n` +
      `> \`${prefix}autojpm on 1h ¡Hola a todos, no olviden ser felices hoy!\`

` +
      `_(Puede enviar texto ordinario o responder fotos/video si desea utilizar los medios)_`;
    return m.reply(helpText);
  }

  const match = input.match(/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/);
  const action = match?.[1]?.toLowerCase() || "";
  const intervalRaw = match?.[2];
  const messageRaw = match?.[3];

  if (["off", "stop", "disable"].includes(action)) {
    const current = getAutoJpmConfig();
    if (!current.enabled) {
      return m.reply(`ℹEl AutoJPM ha sido deshabilitado.`);
    }
    setAutoJpmConfig({ ...current, enabled: false });
    stopAutoJpmScheduler();
    return m.reply(`✅ AutoJPM está desactivado.`);
  }

  if (["status", "info"].includes(action)) {
    const current = getAutoJpmConfig();
    if (!current?.message) {
      return m.reply(`ℹEKG AutoJPM no está configurado todavía.`);
    }
    const statusText =
      `📢 *STATUS AUTO JPM*\n\n` +
      `Status: *${current.enabled ? "✅ ACTIVO" : "❌ INACTIVO"}*\n` +
      `Interval: *${formatInterval(current.intervalMs || 0)}*\n\n` +
      `*HORARIO:*
` +
      `• Último: ${formatTimestamp(current.lastRun)}\n` +
      `• Siguiente: ${formatTimestamp(current.nextRun)}\n\n` +
      `*MENSAJE:*
` +
      `• Texto: \`${previewText(current.message?.text)}\`\n` +
      `• Media: *${current.message?.media?.type ? current.message.media.type.toUpperCase() : "NO HAY"}*`;
    return m.reply(statusText);
  }

  if (!["on", "start", "enable"].includes(action)) {
    return m.reply(`❌ Formato inválido. ${prefix}autojpm on/off/status.`);
  }

  if (!intervalRaw) {
    return m.reply(
      `❌ El intervalo es obligatorio. Ejemplo: ${prefix}autojpm en 1h Mensaje.`,
    );
  }

  const intervalMs = parseInterval(intervalRaw);
  if (!intervalMs) {
    return m.reply(`❌ Intervalo inválido. Ejemplo: 10m, 1h, 2h30m, 1d.`);
  }

  if (intervalMs < 15 * 60 * 1000) {
    return m.reply(`❌ Intervalo mínimo de 15 minutos para prevenir el spam.`);
  }

  const existing = getAutoJpmConfig();
  const quoted = m.quoted || m;
  const mediaInfo = getMediaInfo(quoted);
  let messageText = normalizeMessageText(messageRaw);

  if (!messageText && mediaInfo) {
    messageText = normalizeMessageText(quoted.body || "");
  }

  let mediaData = existing?.message?.media || null;
  if (mediaInfo) {
    const buffer = await quoted.download();
    if (!buffer) {
      return m.reply(`❌ No pude recuperar los medios.`);
    }
    const mimetype = mediaInfo.mimetype || getMimeType(buffer);
    const extension = getExtension(mimetype);
    const fileName = mediaInfo.fileName || `autojpm_${Date.now()}.${extension}`;
    const storageDir = getAutoJpmStorageDir();
    const filePath = path.join(storageDir, fileName);
    fs.writeFileSync(filePath, buffer);
    cleanupStoredMedia(existing?.message?.media?.path, filePath);
    mediaData = {
      type: mediaInfo.type,
      path: filePath,
      mimetype,
      fileName,
    };
  }

  if (
    !messageText &&
    !mediaData &&
    !existing?.message?.text &&
    !existing?.message?.media
  ) {
    return m.reply(`❌ Mensaje o medios necesarios para ser rellenados.`);
  }

  const updatedConfig = {
    enabled: true,
    intervalMs,
    message: {
      text: messageText || existing?.message?.text || "",
      media: mediaData,
    },
    lastRun: 0,
    nextRun: Date.now() + intervalMs,
  };

  setAutoJpmConfig(updatedConfig);
  startAutoJpmScheduler(sock);

  const detailText =
    `✅ *AUTO JPM ACTIVO*

` +
    `╭┈┈⬡「 📋 *DETAIL* 」\n` +
    `┃ ⏱️ Interval: ${formatInterval(intervalMs)}\n` +
    `┃ 🕒 Next: ${formatTimestamp(updatedConfig.nextRun)}\n` +
    `┃ 📷 Media: ${updatedConfig.message.media?.type || "No"}\n` +
    `┃ 📝 Mensaje: ${previewText(updatedConfig.message.text)}\n` +
    `╰┈┈┈┈┈┈┈┈⬡`;

  return m.reply(detailText);
}

export { pluginConfig as config, handler }
