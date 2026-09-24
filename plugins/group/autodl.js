import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: ['autodl', 'autodownload'],
    alias: [],
    category: 'group',
    description: 'Toggle auto download link sosmed',
    usage: '.autodl on/off',
    example: '.autodl on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    
    const groupData = db.getGroup(m.chat)
    const current = groupData?.autodl || false
    
    if (!args || args === 'status') {
        return m.reply(
            `🔗 *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `> Status: ${current ? "✅ Activo" : "❌ Inactivo"}\n\n` +
            `*Platform Support:*\n` +
            `> TikTok, Instagram, Facebook\n` +
            `> YouTube, Twitter/X\n` +
            `> Telegram, Discord\n\n` +
            `*Uso:*
` +
            `> \`${m.prefix}autodl on\` - Activa
` +
            `> \`${m.prefix}autodl off\` - Desactivación`
        )
    }
    
    if (args === 'on') {
        db.setGroup(m.chat, { ...groupData, autodl: true })
        m.react('✅')
        return m.reply(
            `✅ *DESCARGA AUTOMÁTICA ACTIVADA*\n\n` +
            `¡Envía un enlace redes sociales y el bot se descargará automáticamente!
` +
            `> Support: TikTok, IG, FB, YouTube, Twitter/X`
        )
    }
    
    if (args === 'off') {
        db.setGroup(m.chat, { ...groupData, autodl: false })
        m.react('❌')
        return m.reply(`❌ *DESCARGA AUTOMÁTICA DESACTIVADA*`)
    }
    
    return m.reply(`❌ *el argumento no es válido*

> Utilice: \`on\` o \`off\``)
}

export { pluginConfig as config, handler }
