import config from "../../config.js";
const pluginConfig = {
  name: "mulaiabsen",
  alias: ["startabsen", "bukaabsen", "openabsen"],
  category: "group",
  description: "Iniciar sesión ausente en grupo (sólo personal)",
  usage: ".mulaiabsen [descripción]",
  example: ".mulaiabsen Reunión semanal",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
};

if (!global.absensi) global.absensi = {};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (global.absensi[chatId]) {
    return m.reply(
      `❌ *todavía hay asistencia*

` +
        `¡Todavía hay sesiones de asistencia en este grupo!

` +
        `> Escribe *.hapusabsen* para eliminar
` +
        `> o *.cekabsen* para ver la lista`,
    );
  }

  const keterangan = m.text?.trim() || "Registro diario";

  global.absensi[chatId] = {
    keterangan: keterangan,
    createdBy: m.sender,
    createdAt: new Date().toISOString(),
    peserta: [],
  };

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  await m.reply(
    `📋 *ASISTENCIA YA ESTÁ FUNCIONANDO*

` +
      `「 📋 *ɪɴғᴏ* 」\n` +
      `📝 ${keterangan}\n` +
      `👑 Creado por: @${m.sender.split("@")[0]}\n` +
      `👥 Participantes: 0

` +
      `Para aquellos de ustedes que quieran participar, por favor escriban *${m.prefix}asistencia*` +
      `Para los administradores que deseen revisar la asistencia, escriban *${m.prefix}cekabsen*` +
      `Para los administradores que deseen eliminar asistencia, por favor escriba *${m.prefix}hapusabsen*`,
    { mentions: [m.sender] },
  );
}

export { pluginConfig as config, handler };
