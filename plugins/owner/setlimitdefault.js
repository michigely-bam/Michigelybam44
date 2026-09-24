import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'setlimitdefault',
    alias: ['setdefaultlimit', 'limitdefault'],
    category: 'owner',
    description: "Establecer límite predeterminado para el nuevo usuario",
    usage: '.setlimitdefault <cantidad>',
    example: '.setlimitdefault 50',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const newLimit = parseInt(args[0])
    
    if (!args[0] || isNaN(newLimit)) {
        const db = getDatabase()
        const currentDefault = db.setting('defaultLimit') || config.limits?.default || 25
        
        return m.reply(
            `📊 *sᴇᴛ ᴅᴇғᴀᴜʟᴛ ʟɪᴍɪᴛ*\n\n` +
            `> límite de defecto actual: \`${currentDefault}\`\n\n` +
            `*Modo de uso:*
` +
            `> \`${m.prefix}setlimitdefault <cantidad>\`\n\n` +
            `*Ejemplo:*
` +
            `> \`${m.prefix}setlimitdefault 50\``
        )
    }
    
    if (newLimit < 1 || newLimit > 1000) {
        return m.reply(`❌ *falló*

> El límite debe ser entre 1 y 1000`)
    }
    
    const db = getDatabase()
    db.setting('defaultLimit', newLimit)
    
    await m.reply(
        `✅ *correcto*

` +
        `> El límite de defecto se cambia a: \`${newLimit}\`\n` +
        `Los nuevos usuarios tendrán este límite`
    )
}

export { pluginConfig as config, handler }
