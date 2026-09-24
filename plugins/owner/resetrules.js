import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetrules',
    alias: ['resetbotrules'],
    category: 'owner',
    description: "Reiniciar las reglas del bot por defecto",
    usage: '.resetrules',
    example: '.resetrules',
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
    
    db.setting('botRules', null)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs RESTABLECIDO*\n\n` +
        `¡> Las reglas del bot se restablecieron correctamente!
` +
        `> Escribe \`${m.prefix}rules\` para ver.`
    )
}

export { pluginConfig as config, handler }
