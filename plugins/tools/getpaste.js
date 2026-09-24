import axios from 'axios'
import * as timeHelper from '../../src/lib/ourin-time.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
  name: "getpaste",
  alias: ["pastebin", "getpb"],
  category: "tools",
  description: "Obtener contenido de Pastebin",
  usage: ".getpaste <link pastebin>",
  example: ".getpaste https://pastebin.com/Gu8RZaqv",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();

  if (!text || !text.includes("pastebin.com")) {
    return m.reply(
      `📋 *ɢᴇᴛ ᴘᴀsᴛᴇʙɪɴ*\n\n` +
        `> Ingrese un enlace válido de Pastebin

` +
        `> Ejemplo: \`${m.prefix}getpaste https://pastebin.com/Gu8RZaqv\``,
    );
  }

  m.react("📋");

  try {
    const apiUrl = `https://zelapioffciall.koyeb.app/tools/pastebin?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (!data.status || !data.content) {
      throw new Error("Fallado para recuperar contenido del enlace.");
    }

    const lineCount = data.content.split("\n").length;
    const timestamp = timeHelper.formatDateTime("DD MMMM YYYY HH:mm:ss");

    const caption =
      `📋 *CONTENIDO DE PASTEBIN*

` +
      `> 🕹 ID: ${data.paste_id || "Desconocido"}\n` +
      `> 📆 Tiempo: ${timestamp}\n` +
      `> 📝 Número de líneas: ${lineCount}\n\n` +
      `\`\`\`\n${data.content.substring(0, 3000)}${data.content.length > 3000 ? "\n... (recortado)" : ""}\n\`\`\``;

    await m.reply(caption);
    m.react("✅");
  } catch (err) {
    m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
