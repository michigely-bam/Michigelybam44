import { clearRegistrationSession } from "./daftar.js";

const pluginConfig = {
  name: "bataldaftar",
  alias: ["cancelreg", "canceldaftar", "regcancel"],
  category: "user",
  description: "Cancelación de la sesión de registro en curso",
  usage: ".bataldaftar",
  example: ".bataldaftar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  skipRegistration: true,
};

async function handler(m) {
  const canceled = clearRegistrationSession(m.sender);

  if (!canceled) {
    return m.reply(`❌ No tienes sesión de registro activa.`);
  }

  return m.reply(
    `✅ La sesión de registro fue cancelada con éxito.

` +
      `> Comienza de nuevo con: \`${m.prefix}daftar\``,
  );
}

export { pluginConfig as config, handler };
