import { getDatabase } from "../../src/lib/ourin-database.js";
import * as timeHelper from "../../src/lib/ourin-time.js";
import { fetchGroupsSafe } from "../../src/lib/ourin-jpm-helper.js";
import config from "../../config.js";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
let cachedThumb = null;
try {
  if (fs.existsSync("./assets/images/ourin.jpg")) {
    cachedThumb = fs.readFileSync("./assets/images/ourin.jpg");
  }
} catch (e) {}

const pluginConfig = {
  name: "jpmupdate",
  alias: ["updatejpm", "broadcastupdate", "shareupdate"],
  category: "jpm",
  description: "Enviar actualizaciones / cambio a todos los grupos",
  usage: ".jpmupdate <versión> | <cambios>",
  example: ".jpmupdate v2.0 | Nuevas funciones:\\n- Batalla de preguntas",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();

  if (global.statusjpm) {
    return m.reply(
      `❌ *falló*

> JPM corriendo. \`${m.prefix}stopjpm\` Parar.`,
    );
  }

  let input = m.text?.trim();

  if (!input) {
    return m.reply(
      `📢 *ANUNCIO DE ACTUALIZACIÓN*\n\n` +
        `¡Envía información actualizada/changelog a todo el grupo!

` +
        `*FORMATO DE USO:*
` +
        `• \`.jpmupdate <versión> | <lista de cambios>\`\n\n` +
        `*EJEMPLO:*\n` +
        `> \`.jpmupdate v3.0 | ✨ Funciones nuevas:\\n- Difusión con mención oculta\\n- Nuevo sistema de ausencia\\n- Correcciones de errores\`\n\n` +
        `Nota: Use \\n para crear nuevas líneas/enter)_`,
    );
  }

  let version = config.bot?.version || "v1.0";
  let changelog = input;

  if (input.includes("|")) {
    const parts = input.split("|");
    version = parts[0].trim();
    changelog = parts.slice(1).join("|").trim();
  }

  if (!changelog) {
    return m.reply(`❌ ¡El cambio no debe estar vacío!`);
  }

  await m.react("🕕");

  try {
    const allGroups = await fetchGroupsSafe(sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blacklistedCount = groupIds.filter((id) =>
      blacklist.includes(id),
    ).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      await m.react("❌");
      return m.reply(
        `❌ *falló*

> No se encontró ningún grupo${blacklistedCount > 0 ? ` (${blacklistedCount} grupo sobre -lista negra` : ""}`,
      );
    }

    const jedaJpm = db.setting("jedaJpm") || 5000;
    const botName = config.bot?.name || "Ourin-AI";
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || botName;

    const dateStr = timeHelper.formatDate("DD MMMM YYYY");

    const updateMessage =
      `🚀 *UPDATE !! | ${version}*\n\n` +
      `📅 *Fecha:* ${dateStr}\n\n` +
      `*CHANGELOG:*\n` +
      `${changelog}\n\n` +
      `*NOTAS:*\n` +
      `> 💡 Escribe *${m.prefix}menu*para explorar estas características.
` +
      `📢 Gracias por el uso. ${botName}_`;

    await m.reply(
      `📢 *ᴊᴘᴍ ᴜᴘᴅᴀᴛᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 🏷️ VERSIÓN: \`${version}\`\n` +
        `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${groupIds.length}\` grupo
` +
        `┃ ⏱️ INTERVALO: \`${jedaJpm}ms\`\n` +
        `┃ 📊 ESTIMACIÓN: \`${Math.ceil((groupIds.length * jedaJpm) / 60000)} minutos\`
` +
        `╰┈┈⬡\n\n` +
        `> Iniciando la difusión de la actualización...`,
    );

    global.statusjpm = true;
    let successCount = 0;
    let failedCount = 0;

    for (const groupId of groupIds) {
      if (global.stopjpm) {
        delete global.stopjpm;
        delete global.statusjpm;

        await m.reply(
          `⏹️ *ᴊᴘᴍ ᴜᴘᴅᴀᴛᴇ DETENIDO*\n\n` +
            `> ✅ Correcto: \`${successCount}\`\n` +
            `> ❌ Falló: \`${failedCount}\`\n` +
            `> ⏸️ Restante: \`${groupIds.length - successCount - failedCount}\``,
        );
        return;
      }

      try {
        await sock.sendMessage(groupId, {
          text: updateMessage,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: saluranId,
              newsletterName: saluranName,
              serverMessageId: 127,
            },
            externalAdReply: cachedThumb
              ? {
                  title: `📢 ANUNCIO DE ACTUALIZACIÓN`,
                  body: `Versión del sistema: ${version}`,
                  thumbnail: cachedThumb,
                  sourceUrl: config.saluran?.link || "",
                  mediaType: 1,
                  renderLargerThumbnail: true,
                }
              : undefined,
          },
        });
        successCount++;
      } catch {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaJpm));
    }

    global.statusjpm = false;
    global.stopjpm = false;

    await m.react("✅");
    await m.reply(
      `✅ ¡La actualización está terminada!

` +
        `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
        `┃ ✅ Completado: ${successCount}\n` +
        `┃ ❌ Falló: ${failedCount}\n` +
        `┃ 📊 Total: ${groupIds.length}\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
    );
  } catch (error) {
    global.statusjpm = false;
    global.stopjpm = false;
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
