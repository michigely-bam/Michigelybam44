import axios from "axios";
import moment from "moment-timezone";
import config from "../../config.js";
import fs from "fs";
import {
  searchKota,
  getTodaySchedule,
  extractPrayerTimes,
} from "../../src/lib/ourin-sholat-api.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "jadwalsholat",
  alias: ["sholat", "prayertime", "jadwalsolat", "waktusolat", "waktusholat"],
  category: "religi",
  description: "Muestra el calendario de oraciones en tiempo real de myquran.com",
  usage: ".jadwalsholat <ciudad>",
  example: ".jadwalsholat Jakarta",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const city = m.args.join(" ").trim() || "Jakarta";
  m.react("🕌");
  try {
    const kota = await searchKota(city);
    if (!kota) {
      m.react("❌");
      return m.reply(
        `❌ *NO ENCONTRADO*

> No se encontró la ciudad "${city}".
> Prueba con otro distrito o nombre de ciudad.`,
      );
    }
    const jadwalData = await getTodaySchedule(kota.id);
    const times = extractPrayerTimes(jadwalData);
    const lokasi = jadwalData.lokasi || kota.lokasi;
    const daerah = jadwalData.daerah || "";
    const today = moment.tz("Asia/Jakarta").format("dddd, DD MMMM YYYY");
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";
    let thumbnail = null;
    try {
      if (fs.existsSync("./assets/images/ourin.jpg")) {
        thumbnail = fs.readFileSync("./assets/images/ourin.jpg");
      }
    } catch {}
    const caption = `🕌 *el calendario de las oraciones*
╭┈┈⬡「 📍 *${lokasi}* 」
┃ 📅 ${today}
┃ 🗺️ ${daerah}
╰┈┈⬡
╭┈┈⬡「 ⏰ *HORARIOS DE ORACIÓN* 」
┃ 🌙 Imsak: \`${times.imsak}\`
┃ 🌅 Fajr: \`${times.subuh}\`
┃ ☀️ AMANECER: \`${times.terbit}\`
┃ 🌤️ ᴅʜᴜʜᴀ: \`${times.dhuha}\`
┃ 🌞 DHUHR: \`${times.dzuhur}\`
┃ 🌇 Asr: \`${times.ashar}\`
┃ 🌆 MAGHRIB: \`${times.maghrib}\`
┃ 🌃 Isha: \`${times.isya}\`
╰┈┈⬡
> _Fuente: myquran.com • ¡No olvides rezar! 🤲_`;
    const adzanUrl = "https://files.catbox.moe/z2bj5s.mp3";
    let adzanBuffer;
    try {
      const res = await axios.get(adzanUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
      adzanBuffer = Buffer.from(res.data);
    } catch {
      adzanBuffer = null;
    }
    const contextInfo = {
      externalAdReply: {
        title: `🕌 — El calendario de la oración — ${lokasi}`,
        body: `${today} | myquran.com`,
        thumbnail,
        sourceUrl: config.saluran?.link || "",
        mediaType: 1,
        renderLargerThumbnail: true,
      },
      forwardingScore: 9999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: saluranId,
        newsletterName: saluranName,
        serverMessageId: 127,
      },
    };
    if (adzanBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          audio: adzanBuffer,
          mimetype: "audio/mpeg",
          ptt: false,
          contextInfo,
        },
        { quoted: m },
      );
      await sock.sendMessage(m.chat, { text: caption }, { quoted: m });
    } else {
      await sock.sendMessage(
        m.chat,
        { text: caption, contextInfo },
        { quoted: m },
      );
    }
    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}
export { pluginConfig as config, handler };
