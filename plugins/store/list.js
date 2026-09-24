import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "list",
  alias: ["liststore", "daftar", "info"],
  category: "store",
  description: "📋 Ver la lista de información de la tienda",
  usage: ".list o .list <número>",
  example: ".list 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const lists = db.setting("storeLists") || [];

  if (lists.length === 0) {
    return m.reply(
      `📋 *No hay información de la tienda*

` +
        `Actualmente no hay información añadida por el administrador 😔

` +
        `Por favor revise más tarde o comuníquese con el administrador para más información.

` +
        `_ 🙏 Gracias por su interés`,
    );
  }

  const input = m.text?.trim();
  const idx = parseInt(input) - 1;

  if (!isNaN(idx) && idx >= 0 && idx < lists.length) {
    const l = lists[idx];
    let txt = `${l.content}`;

    if (l.image) {
      await sock.sendMessage(
        m.chat,
        { image: { url: l.image }, caption: txt },
        { quoted: m },
      );
      return;
    }
    if (l.video) {
      await sock.sendMessage(
        m.chat,
        { video: { url: l.video }, caption: txt },
        { quoted: m },
      );
      return;
    }
    return m.reply(txt);
  }

  let txt = `📋 *INFORMACIÓN TICO LAND*

`;
  txt += `Aquí está la información disponible 📝
`;
  txt += `Escribe \`${m.prefix}lista de datos\` para ver los detalles.

`;

  for (let i = 0; i < lists.length; i++) {
    const l = lists[i];
    const mediaIcon = l.image ? "🖼️" : l.video ? "🎬" : "📝";
    txt += `*${i + 1}.* ${mediaIcon} *${l.name}*\n`;
  }
  txt += "\n";

  txt += `💡 Escribe \`${m.prefix}lista de datos\` para leer detalles de información_`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
