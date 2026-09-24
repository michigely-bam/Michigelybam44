import { getDatabase } from "../../src/lib/ourin-database.js";
const pluginConfig = {
  name: "setwelcome",
  alias: ["customwelcome"],
  category: "group",
  description: "Set custom welcome message",
  usage: ".setwelcome > Mensaje",
  example: ".setwelcome Hola, bienvenido a {group}!",
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
  const text = m.fullArgs?.trim() || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ᴡᴇʟᴄᴏᴍᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\` - Nombre de miembro
` +
        `┃ ◦ \`{number}\` - Número miembro
` +
        `┃ ◦ \`{group}\` - Nombre del grupo
` +
        `┃ ◦ \`{desc}\` - Descripción del grupo
` +
        `┃ ◦ \`{count}\` - Número de miembros
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
        `\`${m.prefix}setwelcome Halo {user}! 👋\`\n` +
        `\`Bienvenido a {group}. Hoy es {day}, {date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅ Bienvenida con éxito *${text}*
¿Quieres restablecerlo? Escribe ${m.prefix}resetwelcome`,
  );
}

export { pluginConfig as config, handler };
