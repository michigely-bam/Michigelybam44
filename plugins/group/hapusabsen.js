const pluginConfig = {
    name: 'hapusabsen',
    alias: ['deleteabsen', 'tutupabsen', 'closeabsen', 'resetabsen'],
    category: 'group',
    description: "Eliminar / Cerrar sesión ausente (sólo personal)",
    usage: '.hapusabsen',
    example: '.hapusabsen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

if (!global.absensi) global.absensi = {}

async function handler(m) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *no hay asistencia*

` +
            `> ¡No hay una sesión de asistencia activa en este grupo!`
        )
    }
    
    const absen = global.absensi[chatId]
    const totalPeserta = absen.peserta.length
    
    delete global.absensi[chatId]
    
    await m.reply(
        `✅ ¡EL ABSENCIO ESTÁ CERRADO!

` +
        `¿Motivo?
` +
        `📝 ${absen.keterangan}\n` +
        `👥 Total de asistentes: ${totalPeserta}\n\n` +
        `La sesión de asistencia ha sido cancelada.`
    )
}

export { pluginConfig as config, handler }
