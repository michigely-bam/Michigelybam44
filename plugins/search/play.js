
 //nombre del complemento: Play
 // Autor del código: michigely bam 

import yts from "yt-search";
import axios from "axios";
import ytdl, { fallbackToMp3Buffer } from "../../src/scraper/ytdl.js";

const EDWARD_API = "https://dv-edward.onrender.com/api";
const EDWARD_KEY = "edward";

const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Busca y descarga música de YouTube",
  usage: ".play <query>",
  example: ".play komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function safeFileName(name) {
  return String(name || "audio")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "audio";
}

/**
 * API 1:
 * Nexray /downloader/v1/ytmp3
 */
async function getNexrayV1(url) {
  try {
    const { data } = await axios.get(
      `https://api.nexray.eu.cc/downloader/v1/ytmp3?url=${encodeURIComponent(url)}`,
      {
        timeout: 15000,
      },
    );

    const download = data?.result?.url;
    const title = data?.result?.title;

    if (!download || !/^https?:\/\//i.test(download)) {
      throw new Error("Nexray V1 no devolvió una URL válida");
    }

    return {
      download,
      title,
      source: "Nexray V1",
    };
  } catch (err) {
    console.error("[PLAY] Nexray V1:", err.message);
    return null;
  }
}

/**
 * API 2:
 * Nexray /downloader/ytmp3
 */
async function getNexrayV2(url) {
  try {
    const { data } = await axios.get(
      `https://api.nexray.eu.cc/downloader/ytmp3?url=${encodeURIComponent(url)}`,
      {
        timeout: 15000,
      },
    );

    const download = data?.result?.url;
    const title = data?.result?.title;

    if (!download || !/^https?:\/\//i.test(download)) {
      throw new Error("Nexray V2 no devolvió una URL válida");
    }

    return {
      download,
      title,
      source: "Nexray V2",
    };
  } catch (err) {
    console.error("[PLAY] Nexray V2:", err.message);
    return null;
  }
}

/**
 * API 3:
 * Edward API
 */
async function getEdwardAudio(url, titleFallback) {
  try {
    const response = await axios.get(
      `${EDWARD_API}/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=${EDWARD_KEY}`,
      {
        timeout: 30000,
      },
    );

    const data = response.data;

    const download = data?.result?.download_url;
    const title = data?.result?.title || titleFallback;
    const author = data?.result?.author || "Desconocido";
    const thumbnail = data?.result?.thumbnail || null;

    if (!data?.status || !download || !/^https?:\/\//i.test(download)) {
      throw new Error("Edward no devolvió una URL válida");
    }

    return {
      download,
      title,
      author,
      thumbnail,
      source: "Edward API",
    };
  } catch (err) {
    console.error("[PLAY] Edward API:", err.message);
    return null;
  }
}

/**
 * Fallback original:
 * ytdl.js
 */
async function getYtdlFallback(url) {
  try {
    const fallback = await ytdl(url, "mp3");

    if (!fallback?.status || !fallback?.dl) {
      throw new Error(fallback?.mess || "ytdl no devolvió audio");
    }

    return {
      download: fallback.dl,
      title: fallback.title,
      source: "ytdl.js",
      isFallback: true,
    };
  } catch (err) {
    console.error("[PLAY] ytdl:", err.message);
    return null;
  }
}

/**
 * Intenta todas las APIs en orden.
 */
async function getPlayAudioDownload(url, titleFallback) {
  // 1. Nexray V1
  let audio = await getNexrayV1(url);
  if (audio) return audio;

  // 2. Nexray V2
  audio = await getNexrayV2(url);
  if (audio) return audio;

  // 3. Edward
  audio = await getEdwardAudio(url, titleFallback);
  if (audio) return audio;

  // 4. ytdl.js
  audio = await getYtdlFallback(url);
  if (audio) return audio;

  throw new Error("Todas las APIs de descarga fallaron");
}

async function handler(m, { sock, text }) {
  const query = m.text?.trim();

  if (!query) {
    return m.reply(
      `🎵 *ᴘʟᴀʏ*\n\n> Ejemplo:\n\`${m.prefix}play komang\``,
    );
  }

  m.react("🕐");

  try {
    // Buscar video
    const search = await yts(query);

    if (!search.videos.length) {
      throw new Error("Video no encontrado");
    }

    const video = search.videos[0];

    let info = `🎵 *NOW PLAYING*\n\n`;
    info += `📌 *Título:* ${video.title}\n\n`;
    info += `*DETAIL*\n`;
    info += `👤 Channel: *${video.author.name}*\n`;
    info += `⏱️ Duración: *${video.duration.timestamp}*\n`;
    info += `👀 Views: *${formatViews(video.views)}*\n`;
    info += `📅 Upload: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;

    if (video.description) {
      const desc = video.description
        .substring(0, 150)
        .replace(/\n/g, " ");

      info += `*Descripción:*
_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }

    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ Envía audio, por favor espera..._`;

    // Preview de YouTube
    await sock.sendPreview(
      m.chat,
      {
        caption: info,
        url: video.url,
        title: video.title,
        description: "YouTube Video",
        image: video.thumbnail,
        previewType: 1,
      },
      {
        quoted: m,
      },
    );

    // Intentar APIs
    const audio = await getPlayAudioDownload(
      video.url,
      video.title,
    );

    console.log(`[PLAY] Fuente utilizada: ${audio.source}`);

    // Si viene de ytdl.js
    if (audio.isFallback) {
      const mp3Buffer = await fallbackToMp3Buffer(audio.download);

      await sock.sendMessage(
        m.chat,
        {
          audio: mp3Buffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${safeFileName(
            audio.title || video.title || "audio",
          )}.mp3`,
        },
        {
          quoted: m,
        },
      );
    } else {
      // Nexray / Edward
      await sock.sendMedia(
        m.chat,
        audio.download,
        `${safeFileName(audio.title || video.title || "audio")}.mp3`,
        m,
        {
          type: "audio",
        },
      );
    }

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);

    m.react("😭");

    await m.reply(
      `❌ *No se pudo descargar el audio.*\n\n` +
      `Todas las APIs disponibles fallaron.`,
    );
  }
}

export {
  pluginConfig as config,
  handler,
};
