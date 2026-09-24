import te from "../../src/lib/ourin-error.js";
import config from "../../config.js";
import videoenhancer from "../../src/scraper/hdvid.js";
const pluginConfig = {
  name: "hdvid",
  alias: ["hdvideo", "enhancevid", "hdv"],
  category: "tools",
  description: "Aumentar la calidad de vídeo a HD con IA",
  usage: ".hdvid (reply video)",
  example: ".hdvid",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isVideo = m.isVideo || (m.quoted && m.quoted.type === "videoMessage");

  if (!isVideo) {
    return m.reply(
      `📹 *ʜᴅ ᴠɪᴅᴇᴏ ᴇɴʜᴀɴᴄᴇʀ*\n\n` +
        `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
        `┃ ◦ Responder el video con \`${m.prefix}hdvid\`\n` +
        `┃ ◦ Enviar el video con la descripción \`${m.prefix}hdvid\`\n` +
        `╰┈┈⬡\n\n` +
        `⚠️ El proceso tarda entre 30 y 60 segundos.
` +
        `> 💎 Función prémium`,
    );
  }

  m.react("🕕");

  try {
    const videoBuffer = (await m?.quoted?.download()) || (await m.download());

    if (!videoBuffer || videoBuffer.length === 0) {
      m.react("❌");
      return m.reply(`❌ *falló*

> ¡No se pudo download video!`);
    }

    if (videoBuffer.length > 50 * 1024 * 1024) {
      m.react("❌");
      return m.reply(`❌ *ᴇʀʀᴏʀ*

¡El video es demasiado grande! Máximo 50 MB.`);
    }

    await m.reply(
      `🎞️ *ʜᴅ ᴠɪᴅᴇᴏ ᴇɴʜᴀɴᴄᴇʀ*

> El vídeo se está subiendo y procesando
> 30-120 segundos de estimación dependiendo de la duración del vídeo`,
    );

    const result = await videoenhancer(videoBuffer, {
      filename: `hdvid-${Date.now()}.mp4`,
      apiKey: config.APIkey?.fgsi,
      pollIntervalMs: 3000,
      timeoutMs: 10 * 60 * 1000,
    });

    await sock.sendMedia(m.chat, result.resultUrl, null, m, {
      type: "video",
      mimetype: "video/mp4",
      fileName: `HDVID-${Date.now()}.mp4`,
    });

    m.react("✅");
  } catch (err) {
    console.log(err);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
