import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addantilink',
    alias: ['addalink', 'addblocklink'],
    category: 'group',
    description: "Agregar enlaces a la lista de antilinks",
    usage: '.addantilink <domain/pattern>',
    example: '.addantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const link = m.text?.toLowerCase()
    
    if (!link) {
        return m.reply(
            `🔗 *ᴀᴅᴅ ᴀɴᴛɪʟɪɴᴋ*\n\n` +
            `> Ingrese el dominio/pattern enlace que desea bloquear

` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}addantilink tiktok.com\`\n` +
            `\`${m.prefix}addantilink chat.whatsapp.com\`\n` +
            `\`${m.prefix}addantilink instagram.com\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    if (antilinkList.includes(link)) {
        return m.reply(`⚠️ Link \`${link}\` ¡Está en la lista de antivínculos!`)
    }
    
    antilinkList.push(link)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ AÑADIDO*\n\n` +
        `> Link: \`${link}\`\n` +
        `> Total: *${antilinkList.length}* link\n\n` +
        `> Usa \`${m.prefix}listantilink\` para ver la lista`
    )
}

export { pluginConfig as config, handler }
