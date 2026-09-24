import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
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
  name: "jpm",
  alias: ["jasher", "jaser"],
  category: "jpm",
  description: "Enviar mensajes a todos los grupos (JPM)",
  usage: ".jpm   mensaje de contacto",
  example: ".jpm ¡Hola a todos!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

function getContextInfo(title = "📢 ᴊᴘᴍ", body = "Mensajería de masas") {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const contextInfo = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (cachedThumb) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: cachedThumb,
      sourceUrl: config.saluran?.link || "",
      mediaType: 1,
      renderLargerThumbnail: true,
    };
  }

  return contextInfo;
}

async function handler(m, { sock }) {
  const db = getDatabase();

  if (m.isGroup) {
    const groupMode = getGroupMode(m.chat, db);
    if (groupMode !== "md" && groupMode !== "all") {
      return m.reply(
        `❌ *modo no es adecuado*

> JPM sólo está disponible en modo MD

\`${m.prefix}botmode md\``,
      );
    }
  }

  const text = m.fullArgs?.trim() || m.text?.trim();
  if (!text) {
    return m.reply(
      `📢 *JPM (SERVICIO DE MENSAJERÍA MASIVA)*

` +
        `Sistema de transmisión automática a todo el grupo registrado.

` +
        `*USO:*
` +
        `• *${m.prefix}jpm <mensaje>* — Enviar una difusión de texto
` +
        `• *${m.prefix}jpm (Responde foto/video)* — Enviar JPM con los medios

` +
        `*OTRAS CARACTERÍSTICAS:*
` +
        `• *${m.prefix}jpmht* — JPM con modo Hidetag (tag todos los miembros)
` +
        `• *${m.prefix}autojpm* — Auto JPM con intervalos automáticos
` +
        `• *${m.prefix}setdelayjpm* — Arreglar las pausas de envío por grupo
` +
        `• *${m.prefix}stopjpm* — Detener el proceso JPM en curso

` +
        `*EJEMPLO:*\n` +
        `> \`${m.prefix}jpm ¡Hola a todos! Este es un mensaje automático del propietario.\``,
    );
  }

  if (global.statusjpm) {
    return m.reply(
      `❌ *falló*

> JPM corriendo. \`${m.prefix}stopjpm\` Parar.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    const qmsg = m.quoted || m;

    if (qmsg.isImage) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "image";
      } catch (e) {}
    } else if (qmsg.isVideo) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "video";
      } catch (e) {}
    }

    const allGroups = await fetchGroupsSafe(sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blacklistedCount = groupIds.filter((id) =>
      blacklist.includes(id),
    ).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *falló*

> No se encontró ningún grupo${blacklistedCount > 0 ? ` (${blacklistedCount} grupo sobre -lista negra` : ""}`,
      );
    }

    const jedaJpm = db.setting("jedaJpm") || 5000;

    await sock.sendMessage(
      m.chat,
      {
        text:
          `📢 *ᴊᴘᴍ*\n\n` +
          `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
          `┃ 📝 mensaje: \`${text.substring(0, 50)}${text.length > 50 ? "..." : ""}\`\n` +
          `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : "No"}\`\n` +
          `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${groupIds.length}\` grupo
` +
          `┃ ⏱️ INTERVALO: \`${jedaJpm}ms\`\n` +
          `┃ 📊 ESTIMACIÓN: \`${Math.ceil((groupIds.length * jedaJpm) / 60000)} minutos\`
` +
          `╰┈┈⬡\n\n` +
          `> Comienza con JPM a todos los grupos...`,
        contextInfo: getContextInfo("📢 ᴊᴘᴍ", "Sending..."),
      },
      { quoted: m },
    );

    global.statusjpm = true;
    let successCount = 0;
    let failedCount = 0;

    const contextInfo = getContextInfo("📢 ᴊᴘᴍ", config.bot?.name || "Ourin");

    for (const groupId of groupIds) {
      if (global.stopjpm) {
        delete global.stopjpm;
        delete global.statusjpm;

        await sock.sendMessage(
          m.chat,
          {
            text:
              `⏹️ *ᴊᴘᴍ DETENIDO*\n\n` +
              `╭┈┈⬡「 📊 *sᴛᴀᴛᴜs* 」\n` +
              `┃ ✅ correcto: \`${successCount}\`\n` +
              `┃ ❌ ERROR: \`${failedCount}\`\n` +
              `┃ ⏸️ restante: \`${groupIds.length - successCount - failedCount}\`\n` +
              `╰┈┈⬡`,
            contextInfo: getContextInfo("⏹️ DETENIDO"),
          },
          { quoted: m },
        );
        return;
      }

      try {
        if (mediaBuffer) {
          await sock.sendMedia(groupId, mediaBuffer, text, null, {
            type: mediaType,
            contextInfo: {
              forwardingScore: 99,
              isForwarded: true,
            },
          });
        } else {
          await sock.sendText(groupId, text, null, {
            contextInfo: {
              forwardingScore: 99,
              isForwarded: true,
            },
          });
        }
        successCount++;
      } catch (err) {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaJpm));
    }

    delete global.statusjpm;

    m.react("✅");
    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *jpm terminado*

` +
          `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
          `┃ ✅ correcto: \`${successCount}\`\n` +
          `┃ ❌ ERROR: \`${failedCount}\`\n` +
          `┃ 📊 ᴛᴏᴛᴀʟ: \`${groupIds.length}\`\n` +
          `╰┈┈⬡`,
        contextInfo: getContextInfo(
          "✅ terminado",
          `${successCount}/${groupIds.length}`,
        ),
      },
      { quoted: m },
    );
  } catch (error) {
    delete global.statusjpm;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
