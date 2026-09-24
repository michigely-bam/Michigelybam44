import { setNotifMakan, toggleNotif, getNotif, deleteNotif, parseJadwal } from '../../src/lib/ourin-notif-scheduler.js'

const pluginConfig = {
    name: 'notifmakan',
    alias: ['jadwalmakan', 'makanreminder'],
    category: 'group',
    description: "Establecer un recordatorio automático de alimentación",
    usage: '.notifmakan on <jam1,jam2,...> [menu] / off / edit <jam1,jam2,...> [menu]',
    example: '.notifmakan on 07.00,12.00,19.00 Arroz con curry',
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

    const existing = getNotif('makan', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? "✅ Activo" : "❌ Inactivo")
            : "⚪ Sin configurar"

        let info = `🍽️ *RECORDATORIO DE COMIDAS*

`
        info += `📌 *Status:* ${status}\n`

        if (existing) {
            info += `⏰ *Horario:* ${existing.jadwal.map(j => `*${j}* WIB`).join(', ')}\n`
            if (existing.menu) info += `🍴 *Menu:* _${existing.menu}_\n`
        }

        info += `
*📋 Uso:*
`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00,19.00\`\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00 Arroz frito\`\n`
        info += `> \`${m.prefix}notifmakan edit 08.00,13.00\`\n`
        info += `> \`${m.prefix}notifmakan off\`\n`
        info += `
> 💡 _El reloj puede usar un colon o un colon (0700 / 7 / 00)_
`
        info += `> 💡 _Puede ser varias horas, separadas por coma._`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *No hay recordatorio de comer* activo en este chat`)
        }
        toggleNotif('makan', sender, chatJid, false)
        return m.reply(`✅ *Se ha desactivado el recordatorio de la comida* 🔕

> Escribe \`${m.prefix}notifmakan on\` para reactivar`)
    }

    if (sub === 'on') {
        if (existing?.enabled && args.length === 1) {
            return m.reply(`⚠️ *¡El recordatorio de la comida está encendido!*

⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB

> Usa \`${m.prefix}notifmakan edit\` para cambiar el calendario`)
        }

        if (existing && args.length === 1) {
            toggleNotif('makan', sender, chatJid, true)
            return m.reply(`✅ *¡Recuerdo de comida reactivado!* 🔔

⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Introdúzcase el horario de comida!*

> Ejemplo: \`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de reloj equivocado!*

> Formato de uso *HH.MM* o *HH:MM*
> Ejemplo: \`07.00,12.30,19.00\``)
        }

        const menu = args.slice(2).join(' ').trim()
        setNotifMakan(sender, chatJid, jadwal, menu)

        let reply = `✅ *¡El recordatorio de comida está encendido!* 🔔

`
        reply += `⏰ *Horario:*
`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* WIB _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menu:* _${menu}_`
        reply += `

> 💡 _La notificación se enviará a este chat todos los días._`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *¡No hay ningún recordatorio de comer todavía!*

> Activar primero: \`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *¡Introdúzca un nuevo horario!*

> Ejemplo: \`${m.prefix}notifmakan edit 08.00,13.00,20.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *¡Formato de reloj equivocado!*

> Formato de uso *HH.MM* o *HH:MM*
> Ejemplo: \`08.00,13.00,20.00\``)
        }

        const menu = args.slice(2).join(' ').trim() || existing.menu || ''
        setNotifMakan(sender, chatJid, jadwal, menu)

        let reply = `✅ *¡Horario de comidas actualizado!* ✏️

`
        reply += `⏰ *Nuevo horario:*
`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* WIB _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menu:* _${menu}_`

        return m.reply(reply)
    }
}

function getMealLabel(jam) {
    const hour = parseInt(jam.split(':')[0], 10)
    if (hour >= 4 && hour < 10) return 'mañana'
    if (hour >= 10 && hour < 15) return 'mediodía'
    if (hour >= 15 && hour < 18) return 'tarde'
    return 'noche'
}

export { pluginConfig as config, handler }
