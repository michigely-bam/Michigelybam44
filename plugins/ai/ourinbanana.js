import { live3d } from "../../src/scraper/seaart.js";
const pluginConfig = {
  name: "ourinbanana",
  alias: [],
  category: "ai",
  description: "Editar la imagen con IA utilizando prompt",
  usage: ".ourinbanana <prompt>",
  example: ".ourinbanana make it anime style",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.args.join(" ");
  if (!prompt) {
    return m.reply(
      `🍌 *OURIN BANANA SUPER*\n\n` +
        `> Editar imágenes con AI

` +
        `\`Ejemplo: ${m.prefix}ourinbanana make it anime style\`\n\n` +
        `> Responda o envíe una imagen con la descripción`,
    );
  }

  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  if (!isImage) {
    return m.reply(
      `🍌 *ɴᴀɴᴏ ʙᴀɴᴀɴᴀ*

> Responder o enviar una imagen con descripción`,
    );
  }

  m.react("🕕");

  try {
    let mediaBuffer;
    if (m.isImage && m.download) {
      mediaBuffer = await m.download();
    } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
      mediaBuffer = await m.quoted.download();
    }

    if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
      m.react("❌");
      return m.reply(`❌ *falló*

> No se pudo download image`);
    }

    const resultBuffer = await live3d(mediaBuffer, prompt).then(
      (res) => res.image,
    );

    m.react("✅");

    await sock.sendMedia(m.chat, resultBuffer, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    m.reply(`🍀 *Waduhh, parece que hay un pinchazo.*
Por favor, inténtelo de nuevo más tarde, por favor no hagas spam`);
  }
}

export { pluginConfig as config, handler };
