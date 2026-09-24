import axios from "axios";
import config from "../../config.js";
import path from "path";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
const NEOXR_APIKEY = config.APIkey?.neoxr || "Propiedad de Bot-OurinMD";

const pluginConfig = {
  name: "emojitoimage",
  alias: ["emoji2img", "emojiimg", "e2i"],
  category: "tools",
  description: "Conversión de emoji a imagen HD (estilo de aplicación)",
  usage: ".emojitoimage <emoji> [style]",
  example: ".emojitoimage 😳 apple",
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const STYLES = [
  "apple",
  "google",
  "microsoft",
  "samsung",
  "whatsapp",
  "twitter",
  "facebook",
];

let thumbTools = null;
try {
  const p = path.join(process.cwd(), "assets/images/ourin-tools.jpg");
  if (fs.existsSync(p)) thumbTools = fs.readFileSync(p);
} catch {}

function getContextInfo(title, body) {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const ctx = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (thumbTools) {
    ctx.externalAdReply = {
      title,
      body,
      thumbnail: thumbTools,
      mediaType: 1,
      renderLargerThumbnail: false,
      sourceUrl: config.saluran?.link || "",
    };
  }

  return ctx;
}

async function handler(m, { sock }) {
  const args = m.args || [];
  const emoji = args[0]?.trim();
  const style = args[1]?.toLowerCase() || "apple";

  if (!emoji) {
    return m.reply(
      `🖼️ *ᴇᴍᴏᴊɪ ᴛᴏ ɪᴍᴀɢᴇ*\n\n` +
        `> Conversión de emoji a imágenes HD

` +
        `*Formato:*\n` +
        `> \`${m.prefix}emojitoimage <emoji> [style]\`\n\n` +
        `*Ejemplo:*
` +
        `> \`${m.prefix}emojitoimage 😳 apple\`\n\n` +
        `*Estyle disponible:*
` +
        `> ${STYLES.join(", ")}`,
    );
  }

  const validStyle = STYLES.includes(style) ? style : "apple";

  m.react("🖼️");

  try {
    const apiUrl = `https://api.neoxr.eu/api/emoimg?q=${encodeURIComponent(emoji)}&style=${validStyle}&apikey=${NEOXR_APIKEY}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data?.status || !data?.data?.url) {
      m.react("❌");
      return m.reply("❌ *falló*\n\n> Emoji no se encuentra o error de API");
    }

    const imgUrl = data.data.url;

    await sock.sendMessage(
      m.chat,
      {
        image: { url: imgUrl },
        caption:
          `🖼️ *ᴇᴍᴏᴊɪ ᴛᴏ ɪᴍᴀɢᴇ*\n\n` +
          `> Emoji: ${emoji}\n` +
          `> Style: ${validStyle}\n` +
          `> Code: ${data.data.code || "-"}`,
        contextInfo: getContextInfo(
          "🖼️ EMOJI IMAGE",
          `${emoji} - ${validStyle}`,
        ),
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
