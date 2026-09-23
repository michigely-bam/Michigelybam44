import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antilinkgc',
    alias: ['algc', 'antilinkgrup'],
    category: 'group',
    description: "Anti-link WhatsApp (grupo, canal, wa.me)",
    usage: '.antilinkgc <on/off/metode> [kick/remove]',
    example: '.antilinkgc on',
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
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'
        
        return m.reply(
            `🔗 *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ*\n\n` +
            `╭┈┈⬡「 📋 *sᴛᴀᴛᴜs* 」\n` +
            `┃ ◦ Status: *${status.toUpperCase()}*\n` +
            `┃ ◦ Mode: *${mode.toUpperCase()}*\n` +
            `╰┈┈⬡\n\n` +
            `*ᴅᴇᴛᴇᴋsɪ:*\n` +
            `> • chat.whatsapp.com (grup)\n` +
            `> • wa.me (kontak)\n` +
            `> • whatsapp.com/channel (saluran)\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}antilinkgc on\` - Aktifkan\n` +
            `> \`${m.prefix}antilinkgc off\` - Nonaktifkan\n` +
            `> \`${m.prefix}antilinkgc metode kick\` - Mode kick user\n` +
            `> \`${m.prefix}antilinkgc metode remove\` - Mode hapus pesan`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkgc: 'on' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* diaktifkan!

> El enlace WA se borrará automáticamente.`)
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkgc: 'off' })
        return m.reply(`❌ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* dinonaktifkan!`)
    }
    
    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode KICK diaktifkan!

> El usuario que envió el enlace WA será pateado.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode DELETE diaktifkan!

> Se eliminará el mensaje con el enlace WA.`)
        } else {
            return m.reply(`❌ ¡Método inválido! \`kick\` atau \`remove\`

> Contoh: \`${m.prefix}antilinkgc metode kick\``)
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode KICK diaktifkan!

> El usuario que envió el enlace WA será pateado.`)
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode DELETE diaktifkan!

> Se eliminará el mensaje con el enlace WA.`)
    }
    
    return m.reply(`❌ Opción inválida! Uso: \`on\`, \`off\`, \`metode kick\`, \`metode remove\``)
}

export { pluginConfig as config, handler }