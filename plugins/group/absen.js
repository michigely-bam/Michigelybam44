import moment from 'moment-timezone'
import config from '../../config.js'
const pluginConfig = {
    name: 'absen',
    alias: ['hadir', 'present'],
    category: 'group',
    description: "Marca la asistencia en la sesión de registro",
    usage: ".absen",
    example: ".absen",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}
if (!global.absensi) global.absensi = {}
async function handler(m, { sock }) {
    const chatId = m.chat
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *no hay asistencia*

` +
            `¡No hay sesiones de asistencia en este grupo!

` +
            `Los administradores pueden comenzar con
` +
            `> *.mulaiabsen [descripción]*`
        )
    }
    const absen = global.absensi[chatId]
    if (absen.peserta.includes(m.sender)) {
        return m.reply(`❌ ¡Estás ausente!`)
    }
    absen.peserta.push(m.sender)
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const list = absen.peserta
        .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n')
    await m.reply(`✅ *¡GENIAL, @${m.sender.split('@')[0]} HADIRR*\n` +
            `FINALIDADES DE ASISTENCIA: ${absen.keterangan}\n` +
            `╭┈┈⬡「 📋 OTRA INFORMACIÓN 」
` +
            `┃ 📅 ${dateStr}\n` +
            `┃ 👥 Total: ${absen.peserta.length}\n` +
            `├┈┈⬡「 📝 *LISTA DE ASISTENCIA* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Escribe *${m.prefix}asistencia*para asistir_
` +
            `> Escribe *${m.prefix}cekabsen*para ver la lista_`,
            { mentions: absen.peserta })
}
export { pluginConfig as config, handler }
