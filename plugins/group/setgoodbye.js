import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Set custom goodbye message",
  usage: ".setgoodbye − Mensaje",
  example: ".Adiós, adiós, nos vemos más tarde.",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ɢᴏᴏᴅʙʏᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre de miembro
` +
        `┃ ◦ \`{number}\` - Número miembro
` +
        `┃ ◦ \`{group}\` - Nombre del grupo
` +
        `┃ ◦ \`{desc}\` - Descripción del grupo
` +
        `┃ ◦ \`{count}\` - El resto de miembros
` +
        `┃ ◦ \`{owner}\` - Nombre del propietario del grupo
` +
        `┃ ◦ \`{date}\` - Fecha (DD/MM/AAAA)
` +
        `┃ ◦ \`{time}\` - Tiempo (HH:mm WIB)
` +
        `┃ ◦ \`{day}\` - Días (el lunes, martes, etc.)
` +
        `┃ ◦ \`{bot}\` - Nombre del bot
` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Ejemplo:\`\n` +
        `\`${m.prefix}setgoodbye Bye {user}! 👋\`\n` +
        `\`Hasta pronto. Hoy es {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Adiós con éxito. *${text}*
¿Quieres restablecerlo? Escribe ${m.prefix}resetgoodbye`,
  );
}

export { pluginConfig as config, handler };
