/**
 * Nombre del complemento: Play
 * API propia: HidenCloud Play API echo por michigely bam 
 */

import yts from "yt-search";
import axios from "axios";

const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Reproduce música de YouTube usando la API propia",
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

async function getPlayAudioDownload(query) {
  try {
    const { data } = await axios.get(
      `http://zeus.hidencloud.com:25452/api/play?query=${encodeURIComponent(query)}`,
      {
        timeout: 30000,
      },
    );

    if (!data?.status || !data?.url) {
      throw new Error(data?.error || "La API no devolvió una URL de audio");
    }

    return {
      download: data.url,
      title: data.title || query,
      mimeType: data.mimeType || "audio/webm",
    };
  } catch (error) {
    console.error("[Play API]", error?.response?.data || error?.message || error);
    throw new Error(
      error?.response?.data?.error ||
        error?.message ||
        "No se pudo obtener el audio",
    );
  }
}

async function handler(m, { sock, text }) {
  const query = m.text?.trim();

  if (!query) {
    return m.reply(
      `🎵 *PLAY*\n\n> Ejemplo:\n\`${m.prefix}play komang\``,
    );
  }

  m.react("🕐");

  try {
    // Buscar información del video para mostrarla al usuario
    const search = await yts(query);

    if (!search.videos?.length) {
      throw new Error("Video no encontrado");
    }

    const video = search.videos[0];

    let info = `🎵 *NOW PLAYING*\n\n`;
    info += `📌 *Título:* ${video.title}\n\n`;
    info += `*DETAIL*\n`;
    info += `👤 Channel: *${video.author?.name || "Desconocido"}*\n`;
    info += `⏱️ Duración: *${video.duration?.timestamp || "Desconocida"}*\n`;
    info += `👀 Views: *${formatViews(video.views)}*\n`;
    info += `📅 Upload: *${video.ago || "Desconocido"}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;

    if (video.description) {
      const desc = video.description
        .substring(0, 150)
        .replace(/\n/g, " ");

      info += `*Descripción:*\n`;
      info += `_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }

    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ Enviando audio, espera..._`;

    // Vista previa
    try {
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
    } catch (previewError) {
      console.warn(
        "[Play] No se pudo enviar la vista previa:",
        previewError?.message || previewError,
      );
    }

    // Obtener audio desde nuestra API
    const audio = await getPlayAudioDownload(query);

    // Enviar audio
    await sock.sendMedia(
      m.chat,
      audio.download,
      audio.title || video.title,
      m,
      {
        type: "audio",
      },
    );

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);

    m.react("😭");

    return m.reply(
      `❌ *No se pudo obtener el audio.*\n\n` +
        `> ${err?.message || "Error desconocido"}`,
    );
  }
}

export { pluginConfig as config, handler };
