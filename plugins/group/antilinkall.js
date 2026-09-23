import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antilinkall',
    alias: ['alall', 'antialllink'],
    category: 'group',
    description: "Anti todo tipo de enlaces",
    usage: '.antilinkall <on/off/metode> [kick/remove]',
    example: '.antilinkall on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}



function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkall || 'off'
        const mode = groupData.antilinkallMode || 'remove'
        
        return m.reply(
            `🔗 *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ*\n\n` +
            `╭┈┈⬡「 📋 *sᴛᴀᴛᴜs* 」\n` +
            `┃ ◦ Status: *${status.toUpperCase()}*\n` +
            `┃ ◦ Mode: *${mode.toUpperCase()}*\n` +
            `╰┈┈⬡\n\n` +
            `> Mendeteksi semua jenis link (http/https/www)\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}antilinkall on\` - Aktifkan\n` +
            `> \`${m.prefix}antilinkall off\` - Nonaktifkan\n` +
            `> \`${m.prefix}antilinkall metode kick\` - Mode kick user\n` +
            `> \`${m.prefix}antilinkall metode remove\` - Mode hapus pesan`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkall: 'on' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* diaktifkan!

> Todos los enlaces serán eliminados automáticamente.`)
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkall: 'off' })
        return m.reply(`❌ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* dinonaktifkan!`)
    }
    
    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'kick' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode KICK diaktifkan!

> El usuario que envió el enlace será pateado.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'remove' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode DELETE diaktifkan!

> El mensaje con el enlace será eliminado.`)
        } else {
            return m.reply(`❌ ¡Método inválido! \`kick\` atau \`remove\`

> Contoh: \`${m.prefix}antilinkall metode kick\``)
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'kick' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode KICK diaktifkan!

> El usuario que envió el enlace será pateado.`)
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'remove' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode DELETE diaktifkan!

> El mensaje con el enlace será eliminado.`)
    }
    
    return m.reply(`❌ Opción inválida! Uso: \`on\`, \`off\`, \`metode kick\`, \`metode remove\``)
}

export { pluginConfig as config, handler }