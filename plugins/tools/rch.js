import ourinApi from "../../src/lib/ourin-apimanager.js";

const pluginConfig = {
  name: "rch",
  alias: ["frch", "reactch", "fakereactch", "fakerch"],
  category: "tools",
  description: "Enviar reacciona al canal de correo WhatsApp",
  usage: ".rch <link_post> <emoji>",
  example: ".rch https://whatsapp.com/channel/xxx/123 😂😍",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.args || [];

  if (args.length < 2) {
    return m.reply(
      `⚠️ ¡Es un error de formato!

` +
        `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
        `┃ \`${m.prefix}rch <link_post> <emoji>\`\n` +
        `╰┈┈⬡\n\n` +
        `📌 *Ejemplo:*\n` +
        `\`${m.prefix}rch https://whatsapp.com/channel/xxx/123 😂\`\n` +
        `\`${m.prefix}rch https://whatsapp.com/channel/xxx/123 😂😱🔥\``,
    );
  }

  const link = args[0];
  const emoji = args.slice(1).join("");

  if (!link.includes("whatsapp.com/channel")) {
    return m.reply(
      `❌ *enlace no es válido*

¡El enlace debe ser del canal de WhatsApp!`,
    );
  }

  if (!emoji) {
    return m.reply(`❌ *emojis vacíos*

> ¡Introdúzcase emoji para reaccionar!`);
  }

  m.react("🕕");

  try {
    const data = await ourinApi.apiFaa.reactChannel(
      {
        url: link,
        react: emoji,
      },
      { timeout: 30000 },
    );

    if (data?.status) {
      m.react("✅");
      await m.reply(
        `✅ *ʀᴇᴀᴄᴛ sᴇɴᴛ!*\n\n` +
          `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
          `┃ 🔗 Target: \`${data.info?.destination || link}\`\n` +
          `┃ 🎭 Emoji: ${data.info?.reaction_used?.replace(/,/g, " ") || emoji.replace(/,/g, " ")}\n` +
          `╰┈┈⬡`,
      );
    } else {
      throw new Error(data?.message || "No se pudo send reaction");
    }
  } catch (err) {
    m.react("❌");
    await m.reply(
      `❌ *falta en enviar una reacción*

` +
        `El límite de RCH se ha agotado, por favor espere al día siguiente

`,
    );
  }
}

export { pluginConfig as config, handler };
