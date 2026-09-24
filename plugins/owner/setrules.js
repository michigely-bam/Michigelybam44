import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setrules',
    alias: ['setbotrules', 'setaturanbot'],
    category: 'owner',
    description: 'Establece reglas personalizadas para el bot',
    usage: '.setrules <text>',
    example: ".Setrules 1. No spam\n2. Respeta a los demás",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `> Ingrese el texto de las nuevas reglas

` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrules 1. No hagas spam\\n2. Respeta a los demás\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `¡> Las reglas del bot se actualizaron correctamente!
` +
        `> Escribe \`${m.prefix}rules\` para ver.`
    )
}

export { pluginConfig as config, handler }
