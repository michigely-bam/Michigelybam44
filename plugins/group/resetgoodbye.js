import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetgoodbye',
    alias: ['delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: "Reiniciar el mensaje de despedida por defecto",
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat)
    
    if (!groupData?.goodbyeMsg) {
        return m.reply(`❌ *falló*

> Mensaje de adiós ya predeterminado`)
    }
    
    db.setGroup(m.chat, { goodbyeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅ *ɢᴏᴏᴅʙʏᴇ RESTABLECIDO*
Volver al mensaje predeterminado`)
}

export { pluginConfig as config, handler }
