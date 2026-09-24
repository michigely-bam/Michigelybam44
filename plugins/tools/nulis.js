import * as _canvas from "@napi-rs/canvas";
import config from "../../config.js";
import path from "path";
import fs from "fs";
import * as timeHelper from "../../src/lib/ourin-time.js";

import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "nulis",
  alias: ["tulis", "write"],
  category: "tools",
  description: "Generar texto manuscrito en papel",
  usage: ".nulis <texto>",
  example: ".Escribir Te amo para siempre",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
let thumbTools = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-games.jpg",
  );
  if (fs.existsSync(thumbPath)) thumbTools = fs.readFileSync(thumbPath);
} catch (e) {}
const fontPath = path.join(process.cwd(), "assets", "fonts", "Zahraaa.ttf");
let _fontRegistered = false;
function getContextInfo(title = "📝 *ɴᴜʟɪs*", body = "Texto manuscrito") {
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
  if (thumbTools) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbTools,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: config.saluran?.link || "",
    };
  }
  return contextInfo;
}
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
async function handler(m, { sock }) {
  const text = m.args?.join(" ");
  if (!text) {
    return m.reply(
      `⚠️ *MODO DE USO*\n\n` +
        `> \`${m.prefix}nulis <texto>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}nulis Te amaré por siempre\``,
    );
  }
  if (text.length > 500) {
    return m.reply(`❌ *texto demasiado largo*

> Un máximo de 500 caracteres`);
  }
  const inputPath = path.join(
    process.cwd(),
    "assets",
    "kertas",
    "magernulis1.jpg",
  );
  if (!fs.existsSync(inputPath)) {
    return m.reply(
      `❌ *template no existe*

> File \`assets/kertas/magernulis1.jpg\` no encontrado`,
    );
  }
  await m.react("🕕");
  await m.reply(`🕕 *PROCESANDO...*

> Generando texto manuscrito...`);
  try {
    const { createCanvas, loadImage, GlobalFonts } = _canvas;
    if (!_fontRegistered && fs.existsSync(fontPath)) {
      try {
        GlobalFonts.registerFromPath(fontPath, "Zahraaa");
      } catch {}
      _fontRegistered = true;
    }
    const bgImage = await loadImage(inputPath);
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImage, 0, 0);
    const tgl = timeHelper.formatDate("DD/MM/YYYY");
    const hari = timeHelper.formatFull("dddd");
    ctx.font = "20px Zahraaa, Arial";
    ctx.fillStyle = "#1a1a2e";
    ctx.fillText(hari, 806, 78);
    ctx.font = "18px Zahraaa, Arial";
    ctx.fillText(tgl, 806, 102);
    ctx.font = "20px Zahraaa, Arial";
    const maxWidth = 600;
    const lineHeight = 28;
    const startX = 344;
    const startY = 142;
    const lines = wrapText(ctx, text, maxWidth);
    lines.forEach((line, i) => {
      ctx.fillText(line, startX, startY + i * lineHeight);
    });
    const buffer = canvas.toBuffer("image/jpeg");
    await m.react("✅");
    await sock.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: `✅ *TEXTO MANUSCRITO*

> ¡Cuidado, que no te descubran! 📖`,
        contextInfo: getContextInfo(),
      },
      { quoted: m },
    );
  } catch (error) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
