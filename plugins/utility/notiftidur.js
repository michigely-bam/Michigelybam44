import { setNotifTidur, toggleNotif, getNotif, deleteNotif, parseJadwal } from '../../src/lib/ourin-notif-scheduler.js'

const pluginConfig = {
    name: 'notiftidur',
    alias: ['jadwaltidur', 'tidurreminder', 'sleepreminder'],
    category: 'group',
    description: "Configure automatic sleep-time reminder",
    usage: ".notificaciones para dormir en < mermelada1, mermelada 2,... √≥n / off / editaciÃ3n",
    example: '.notiftidur on 22.00',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const chatJid = m.chat
    const sender = m.sender

    const existing = getNotif('tidur', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Aktif' : '❌ Nonaktif')
            : '⚪ Belum diatur'

        let info = `🌙 *PENGINGAT TIDUR*\n\n`
        info += `📌 *Status:* ${status}\n`

        if (existing) {
            info += `⏰ *Jadwal:* ${existing.jadwal.map(j => `*${j}* WIB`).join(', ')}\n`
        }

        info += `
*📋 Usage:*
`
        info += `> \`${m.prefix}notiftidur on 22.00\`\n`
        info += `> \`${m.prefix}notiftidur on 22.00,23.30\`\n`
        info += `> \`${m.prefix}notiftidur edit 23.00\`\n`
        info += `> \`${m.prefix}notiftidur off\`\n`
        info += `
> 💡 _El reloj puede usar un colon o un colon (22.00 / 22: 00)_
`
        info += `> 💡 _Puede ser varias horas, separadas por coma._`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *Aún no hay recordatorio para dormir.* activo en este chat`)
        }
        toggleNotif('tidur', sender, chatJid, false)
        return m.reply(`✅ *Pengingat tidur dinonaktifkan* 🔕\n\n> Ketik \`${m.prefix}notiftidur on\` para reactivar`)
    }

    if (sub === 'on') {
        if (existing?.enabled && args.length === 1) {
            return m.reply(`⚠️ *¡El recordatorio de dormir está encendido!*

⏰ Jadwal: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB\n\n> Gunakan \`${m.prefix}notiftidur edit\` para cambiar el calendario`)
        }

        if (existing && args.length === 1) {
            toggleNotif('tidur', sender, chatJid, true)
            return m.reply(`✅ *¡El recordatorio de sueño se ha reactivado!* 🔔

⏰ Jadwal: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Pongan el horario de sueño!*

> Contoh: \`${m.prefix}notiftidur on 22.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de reloj equivocado!*

> Formato de uso *HH.MM* atau *HH:MM*
> Contoh: \`22.00\` atau \`23.30\``)
        }

        setNotifTidur(sender, chatJid, jadwal)

        let reply = `✅ *¡Recuerde dormir!* 🔔

`
        reply += `⏰ *Jadwal:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* WIB\n`
        }
        reply += `
> 💡 _La notificación se enviará a este chat todos los días._`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *¡No hay recordatorio de dormir!*

> Aktifkan dulu: \`${m.prefix}notiftidur on 22.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Introdúzca un nuevo horario!*

> Contoh: \`${m.prefix}notiftidur edit 23.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de reloj equivocado!*

> Formato de uso *HH.MM* atau *HH:MM*
> Contoh: \`23.00\` atau \`22.30\``)
        }

        setNotifTidur(sender, chatJid, jadwal)

        let reply = `✅ *Jadwal tidur diperbarui!* ✏️\n\n`
        reply += `⏰ *Nuevo horario:*
`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* WIB\n`
        }

        return m.reply(reply)
    }
}

export { pluginConfig as config, handler }
