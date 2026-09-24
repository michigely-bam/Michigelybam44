import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "confess",
  alias: ["confession", "menfess", "anonim"],
  category: "fun",
  description: "Enviar un mensaje anónimo a alguien",
  usage: '.confess <número>|<mensaje>',
  example: '.confess 6281234567890|Hola, me gustas',
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

if (!global.confessData) global.confessData = new Map();

async function handler(m, { sock }) {
  const input = m.fullArgs?.trim() || m.text?.trim();

  if (!input || !input.includes("|")) {
    return m.reply(
      `💌 *ᴀɴᴏɴʏᴍᴏᴜs ᴄᴏɴꜰᴇss*\n\n` +
        `¡Envía mensajes anónimos a alguien!

` +
        `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
        `┃ Formato:\n` +
        `┃ \`${m.prefix}confess número|mensaje\`\n` +
        `┃\n` +
        `┃ Ejemplo:\n` +
        `┃ \`${m.prefix}confess 6281234567890|¡Hola!\`
` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ⚠️ ¡Tu identidad permanecerá oculta!`,
    );
  }

  const [rawNumber, ...messageParts] = input.split("|");
  const message = messageParts.join("|").trim();

  if (!rawNumber || !message) {
    return m.reply(
      `❌ ¡Formato equivocado!

> Usa: \`${m.prefix}confess <número>|<mensaje>\``,
    );
  }

  let targetNumber = rawNumber.trim().replace(/[^0-9]/g, "");

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌ ¡Número inválido!`);
  }

  const targetJid = targetNumber + "@s.whatsapp.net";

  const senderNumber = m.sender.split("@")[0];
  if (targetNumber === senderNumber) {
    return m.reply(`❌ ¡No puedes enviarte una confesión!`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetNumber);
    if (!onWa?.exists) {
      return m.reply(
        `❌ Número \`${targetNumber}\` ¡No está registrado en WhatsApp!`,
      );
    }
  } catch (e) {}

  if (message.length < 5) {
    return m.reply(`❌ ¡El mensaje es demasiado corto! Mínimo 5 caracteres.`);
  }

  if (message.length > 1000) {
    return m.reply(`❌ Mensaje demasiado largo! Máximo 1000 caracteres.`);
  }

  const confessText =
    `💌 *hay un mensaje de alguien nichh*

` +
    `" 📨 *mensaje: de alguien* "
` +
    ` 💕 *con mensaje:*
` +
    `\`\`\`${message}\`\`\`\n` +
    `> 🔒 _La identidad del remitente permanecerá oculta_
` +
    `💬 ¡Responda a este mensaje para responder!`;

  try {
    const sentMsg = await sock.sendMessage(targetJid, {
      text: confessText,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    global.confessData.set(sentMsg.key.id, {
      senderJid: m.sender,
      senderChat: m.chat,
      targetJid: targetJid,
      createdAt: Date.now(),
    });

    setTimeout(
      () => {
        global.confessData.delete(sentMsg.key.id);
      },
      24 * 60 * 60 * 1000,
    );

    await m.reply(
      `✅ *¡CONFESIÓN ENVIADA!*

` +
        `> Mensajes enviados a: \`${targetNumber}\`\n` +
        `> ¡Tu identidad está protegida! 🔒

` +
        `💬 ¡Si él responde, su respuesta será enviada aquí!`,
    );
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId) return false;

  const confessInfo = global.confessData.get(quotedId);
  if (!confessInfo) return false;

  if (m.sender !== confessInfo.targetJid) return false;

  const replyMessage = m.body?.trim();
  if (!replyMessage) return false;

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const replyText =
    `💌 ¡La retribución de quien confesasteis!

` +
    `「 📨 *RESPUESTA* 」
` +
    ` 💕 *con mensaje:*
` +
    `\`\`\`${replyMessage}\`\`\`\n` +
    `> 🔒 _La identidad permanece oculta_`;

  try {
    await sock.sendMessage(confessInfo.senderChat, {
      text: replyText,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    });

    await sock.sendMessage(m.chat, {
      text: `✅ ¡Tu respuesta ha sido enviada de forma anónima!`,
    });

    global.confessData.delete(quotedId);

    return true;
  } catch (error) {
    return false;
  }
}

export { pluginConfig as config, handler, replyHandler };
