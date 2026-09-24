import { load } from 'cheerio'
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "murrotal",
  alias: ["murottal", "audioquran", "quraudio"],
  category: "islamic",
  description: "Escucha la recitación del Corán por sura",
  usage: ".murrotal < correspondencia > nombre",
  example: ".murrotal al fatihah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = m.args?.join(" ")?.trim();

  if (!query) {
    return m.reply(
      `🎧 *MURROTTAL*\n\n` +
        `> Ingrese el nombre del capítulo

` +
        `\`Ejemplo: ${m.prefix}murrotal al fatihah\`\n` +
        `\`Ejemplo: ${m.prefix}murrotal ar rahman\``,
    );
  }

  m.react("🔍");

  try {

    const res = await fetch("https://islamipedia.id/murottal/");
    const html = await res.text();
    const $ = load(html);

    const data = $(".surah-item")
      .map((i, el) => ({
        no: parseInt($(el).find("h5").text().split(".")[0]),
        surah: ($(el).attr("data-title") || "").toLowerCase(),
        arti: $(el).find("p").text().trim(),
        audio: $(el).attr("data-audio") || "",
      }))
      .get();

    const q = query.toLowerCase();
    const find = data.find((v) =>
      v.surah.replace(/[^a-z0-9]/g, "").includes(q.replace(/[^a-z0-9]/g, "")),
    );

    if (!find || !find.audio) {
      m.react("❌");
      return m.reply(`❌ La sura *${query}* no encontrado`);
    }

    m.react("✅");

    await sock.sendMedia(m.chat, find.audio, null, m, {
      type: "audio",
    });
  } catch (e) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
