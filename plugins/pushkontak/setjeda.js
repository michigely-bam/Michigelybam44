import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setjeda',
    alias: ['setdelay', 'jeda'],
    category: 'pushkontak',
    description: "Establecer el retraso para pushcontact / jpm",
    usage: '.setjeda <push/jpm> <ms>',
    example: '.setjeda push 5000',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const currentJedaPush = db.setting('jedaPush') || 5000
    const currentJedaJpm = db.setting('jedaJpm') || 5000
    
    if (args.length < 2) {
        return m.reply(
            `⏱️ *sᴇᴛ ᴊᴇᴅᴀ*\n\n` +
            `╭┈┈⬡「 📋 *sᴇᴛᴛɪɴɢ sᴀᴀᴛ ɪɴɪ* 」\n` +
            `┃ 📤 ᴊᴇᴅᴀ ᴘᴜsʜ: \`${currentJedaPush}ms\`\n` +
            `┃ 📢 ᴊᴇᴅᴀ ᴊᴘᴍ: \`${currentJedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}setjeda push 5000\`\n` +
            `> \`${m.prefix}setjeda jpm 6000\`\n\n` +
            `> _1 detik = 1000ms_`
        )
    }
    
    const target = args[0].toLowerCase()
    const value = parseInt(args[1])
    
    if (!['push', 'jpm'].includes(target)) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Pilihan: \`push\` atau \`jpm\``)
    }
    
    if (isNaN(value) || value < 1000) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*

> Ingrese el número mínimo 1000 (1 segundo)`)
    }
    
    if (value > 60000) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*

> Máximo 60000 (1 minuto)`)
    }
    
    if (target === 'push') {
        db.setting('jedaPush', value)
        m.react('✅')
        return m.reply(`✅ *ᴊᴇᴅᴀ ᴘᴜsʜ ᴅɪᴜʙᴀʜ*\n\n> Jeda: \`${value}ms\` (${value/1000} detik)`)
    }
    
    if (target === 'jpm') {
        db.setting('jedaJpm', value)
        m.react('✅')
        return m.reply(`✅ *ᴊᴇᴅᴀ ᴊᴘᴍ ᴅɪᴜʙᴀʜ*\n\n> Jeda: \`${value}ms\` (${value/1000} detik)`)
    }
}

export { pluginConfig as config, handler }