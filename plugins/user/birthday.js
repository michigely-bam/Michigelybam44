import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'birthday',
    alias: ['bday', 'ultah', 'ulangtahun'],
    category: 'user',
    description: "Mira el cumpleaños del miembro",
    usage: '.birthday [@user]',
    example: '.birthday @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const cleanJid = target.replace(/@.+/g, '')
    const db = getDatabase()
    const user = db.getUser(target)
    
    if (!user?.birthday) {
        if (target === m.sender) {
            return m.reply(
                `❌ ¡No tienes cumpleaños fijados!

` +
                `> Usa: ${m.prefix}setbirthday DD-MM\n` +
                `> Ejemplo: ${m.prefix}setbirthday 25-12`
            )
        }
        return m.reply(`❌ ¡El usuario aún no ha fijado el cumpleaños!`)
    }
    
    const [day, month] = user.birthday.split('-').map(Number)
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    
    const now = new Date()
    const currentYear = now.getFullYear()
    let nextBday = new Date(currentYear, month - 1, day)
    
    if (nextBday < now) {
        nextBday = new Date(currentYear + 1, month - 1, day)
    }
    
    const diffTime = nextBday.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const isToday = now.getDate() === day && now.getMonth() === month - 1
    
    let text = `🎂 *ʙɪʀᴛʜᴅᴀʏ ɪɴғᴏ*\n\n`
    text += `╭┈┈⬡「 👤 *ᴜsᴇʀ* 」\n`
    text += `┃ 🏷️ @${cleanJid}\n`
    text += `┃ 📅 ${day} ${months[month - 1]}\n`
    
    if (isToday) {
        text += `┃ 🎉 *¡Hoy es un gran día!*
`
    } else {
        text += `┃ 🕕 ${diffDays} Más días
`
    }
    
    text += `╰┈┈┈┈┈┈┈┈⬡`
    
    if (isToday) {
        text += `\n\n🎊 *HAPPY BIRTHDAY!* 🎊\n`
        text += `> Viva y viva mucho tiempo.
`
        text += `> ¡Que siempre tengas éxito! 🎉🎂`
    }
    
    await m.reply(text, { mentions: [target] })
}

export { pluginConfig as config, handler }
