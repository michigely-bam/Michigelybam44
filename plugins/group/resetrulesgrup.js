import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetrulesgrup',
    alias: ['resetgrouprules'],
    category: 'group',
    description: "Reiniciar las reglas del grupo por defecto (sólo a la memoria)",
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
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
    
    db.setGroup(m.chat, { groupRules: null })
    
    m.reply(
        `✅ *el grupo de reglas se rediseñó*
` +
        `¡Las reglas del grupo se restablecieron correctamente!
` +
        `Escribe \`${m.prefix}rulesgrup\` para ver.`
    )
}

export { pluginConfig as config, handler }
