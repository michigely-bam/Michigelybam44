import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetwelcome',
    alias: ['delwelcome', 'clearwelcome'],
    category: 'group',
    description: "Reiniciar el mensaje de bienvenida por defecto",
    usage: '.resetwelcome',
    example: '.resetwelcome',
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
    
    if (!groupData?.welcomeMsg) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*

> Mensaje de bienvenida ya predeterminado`)
    }
    
    db.setGroup(m.chat, { welcomeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅ *ᴡᴇʟᴄᴏᴍᴇ ᴅɪʀᴇsᴇᴛ*

> Volver al mensaje predeterminado`)
}

export { pluginConfig as config, handler }