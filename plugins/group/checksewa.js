import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
const pluginConfig = {
    name: 'checksewa',
    alias: ['ceksewa', 'sisasewa'],
    category: 'group',
    description: "Compruebe el tiempo de alquiler de robot restante en este grupo",
    usage: '.checksewa',
    example: '.checksewa',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatCountdown(expiredAt) {
    const diff = expiredAt - Date.now()
    if (diff <= 0) return { text: 'EXPIRED', expired: true }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    let text = ''
    if (days > 0) text += `${days} días `
    if (hours > 0) text += `${hours} horas `
    if (minutes > 0 && days === 0) text += `${minutes} minutos`
    return { text: text.trim(), expired: false }
}

function handler(m) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    if (!db.db.data.sewa.enabled) {
        return m.reply(`ℹOlvídate del sistema de alquiler.

Este bot se puede utilizar en todos los grupos.`)
    }

    const sewaData = db.db.data.sewa.groups[m.chat]

    if (!sewaData) {
        return m.reply(`❌ Este grupo no está incluido en el sistema de alquileres

Llame al propietario para la información de alquiler.`)
    }

    const groupName = sewaData.name || m.chat.split('@')[0]
    const addedDate = sewaData.addedAt ? timeHelper.fromTimestamp(sewaData.addedAt, 'D MMMM YYYY') : '-'

    if (sewaData.isLifetime) {
        m.react('♾️')
        return m.reply(
            `♾️ *ESTADO DEL ALQUILER*

` +
            `Grupo: *${groupName}*\n` +
            `Estado: *Permanente* ♾️\n` +
            `Registrado desde: *${addedDate}*\n\n` +
            `el bot estarán activos para siempre en este grupo.`
        )
    }

    const countdown = formatCountdown(sewaData.expiredAt)
    const expiredStr = timeHelper.fromTimestamp(sewaData.expiredAt, 'D MMMM YYYY HH:mm')

    if (countdown.expired) {
        return m.reply(
            `❌ *ALQUILER VENCIDO*

` +
            `Grupo: *${groupName}*\n` +
            `Finaliza: *${expiredStr}*\n\n` +
            `Póngase en contacto con el propietario del bot para extender el alquiler.`
        )
    }

    const diff = sewaData.expiredAt - Date.now()
    const isAlmostExpired = diff <= 259200000

    m.react(isAlmostExpired ? '⚠️' : '⏱️')
    let text = `⏱️ *ESTADO DEL ALQUILER*

`
    text += `Grupo: *${groupName}*\n`
    text += `Tiempo restante: *${countdown.text}*\n`
    text += `Finaliza: *${expiredStr}*\n`
    text += `Registrado desde: *${addedDate}*`

    if (isAlmostExpired) {
        text += `

⚠️ Llame al dueño para extenderse.`
    }

    return m.reply(text)
}

export { pluginConfig as config, handler }
