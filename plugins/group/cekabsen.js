import moment from "moment-timezone";
import config from "../../config.js";
const pluginConfig = {
  name: "cekabsen",
  alias: ["listabsen", "daftarabsen", "lihathadir"],
  category: "group",
  description: "Ver la lista de ausencias ya ausentes",
  usage: ".cekabsen",
  example: ".cekabsen",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
if (!global.absensi) global.absensi = {};
async function handler(m, { sock }) {
  const chatId = m.chat;
  if (!global.absensi[chatId]) {
    return m.reply(
      `❌ *no hay asistencia*

` +
        `¡No hay sesiones de asistencia en este grupo!

` +
        `Los administradores pueden comenzar con
` +
        `> *.mulaiabsen [descripción]*`,
    );
  }
  const absen = global.absensi[chatId];
  const now = moment().tz("Asia/Jakarta");
  const dateStr = now.format("D MMMM YYYY");
  const createdDate = moment(absen.createdAt).tz("Asia/Jakarta");
  const timeStr = createdDate.format("HH:mm");
  let list = "┃ _Nadie está ausente._";
  if (absen.peserta.length > 0) {
    list = absen.peserta
      .map((jid, i) => `┃ ${i + 1}. @${jid.split("@")[0]}`)
      .join("\n");
  }
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";
  await m.reply(
    `📋 *LISTA DE AUSENTES*

` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 📝 ${absen.keterangan}\n` +
      `┃ 📅 ${dateStr}\n` +
      `┃ ⏰ Iniciado: ${timeStr}\n` +
      `┃ 👑 Se hizo: @${absen.createdBy.split("@")[0]}\n` +
      `├┈┈⬡「 👥 *PARTICIPANTES (${absen.peserta.length})* 」\n` +
      `${list}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `Escribe *${m.prefix}asistencia*para asistir`,
    { mentions: [...absen.peserta, absen.createdBy] },
  );
}
export { pluginConfig as config, handler };
