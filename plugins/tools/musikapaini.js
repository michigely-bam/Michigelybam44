import axios from "axios";
import FormData from "form-data";
import config from "../../config.js";
import { downloadMediaMessage } from "ourin";
import path from "path";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";

const pluginConfig = {
  name: "musikapaini",
  alias: ["whatmusic", "shazam", "recognizemusic", "mai"],
  category: "tools",
  description: "Identificar una canción a partir del audio",
  usage: ".musikapaini (reply audio)",
  example: ".musikapaini",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

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

async function uploadTo0x0(buffer, filename) {
  const form = new FormData();
  form.append("file", buffer, {
    filename,
    contentType: "application/octet-stream",
  });

  const res = await axios.post(
    "https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk",
    form,
    {
      headers: form.getHeaders(),
      timeout: 60000,
    },
  );

  if (!res.data?.status ? res.data.path : "") throw new Error("Error al subir");
  return res.data;
}

async function handler(m, { sock }) {
  let audioBuffer = null;
  let filename = "audio.mp3";

  if (m.quoted?.message) {
    const quotedMsg = m.quoted.message;
    const audioMsg = quotedMsg.audioMessage || quotedMsg.documentMessage;

    if (audioMsg) {
      try {
        audioBuffer = await downloadMediaMessage(
          { key: m.quoted.key, message: quotedMsg },
          "buffer",
          {},
        );
        filename = audioMsg.fileName || "audio.mp3";
      } catch {}
    }
  }

  if (!audioBuffer && m.message) {
    const audioMsg = m.message.audioMessage || m.message.documentMessage;
    if (audioMsg) {
      try {
        audioBuffer = await m.download();
        filename = audioMsg.fileName || "audio.mp3";
      } catch {}
    }
  }

  if (!audioBuffer) {
    return m.reply(
      `🎵 ¿Qué tipo de música es esta?

` +
        `> Identificar una canción a partir del audio

` +
        `*Modo de uso:*
` +
        `> Responder audio con \`${m.prefix}musikapaini\`\n` +
        `> O envíe el comando de audio + captura`,
    );
  }

  m.react("🎵");

  try {
    await m.reply("🕕 *SUBIENDO...*\n\n> Subiendo el audio...");

    const audioUrl = await uploadTo0x0(audioBuffer, filename);

    await m.reply("🔍 *IDENTIFICANDO...*\n\n> Buscando información de la canción...");

    const data = await ourinApi.neoxr.whatMusic(
      {
        url: audioUrl,
        apikey: config.APIkey?.neoxr || "Propiedad de Bot-OurinMD",
      },
      {
        timeout: 60000,
      },
    );

    if (!data?.status || !data?.data) {
      m.react("❌");
      return m.reply("❌ *falló*\n\n> Error desconocido de la canción o API");
    }

    const music = data.data;
    const links = music.links || {};

    let text = `🎵 *CANCIÓN ENCONTRADA!*\n\n`;
    text += `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n`;
    text += `┃ 🎶 Title: ${music.title || "-"}\n`;
    text += `┃ 👤 Artist: ${music.artist || "-"}\n`;
    text += `┃ 💿 Album: ${music.album || "-"}\n`;
    text += `┃ 📅 Release: ${music.release || "-"}\n`;
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    const buttons = [];

    if (links.spotify?.track?.id) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "🎧 Spotify",
          url: `https://open.spotify.com/track/${links.spotify.track.id}`,
        }),
      });
    }

    if (links.youtube?.vid) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "▶️ YouTube",
          url: `https://youtube.com/watch?v=${links.youtube.vid}`,
        }),
      });
    }

    if (links.deezer?.track?.id) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "🎵 Deezer",
          url: `https://deezer.com/track/${links.deezer.track.id}`,
        }),
      });
    }

    const msgContent = {
      text,
      footer: "🎵 Music Recognition",
      contextInfo: getContextInfo(
        "🎵 ¿Qué música es esta?",
        music.title || "Music Found",
      ),
    };

    if (buttons.length > 0) {
      msgContent.interactiveButtons = buttons;
    }

    await sock.sendMessage(m.chat, msgContent, { quoted: m });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
