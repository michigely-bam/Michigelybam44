import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setrulesgrup',
    alias: ['setgrouprules', 'setaturangrup'],
    category: 'group',
    description: "Establecer reglas / reglas grupo personalizado (sólo amin)",
    usage: '.setrulesgrup <text>',
    example: ".setrules grupo 1. No spam\n2. Respeta a los demás",
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
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *set grupo de reglas*

` +
            `> Ingrese el texto de las nuevas reglas

` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrulesgrup 1. No hagas spam\\n2. Respeta a los demás\``
        )
    }
    
    db.setGroup(m.chat, { groupRules: text })
    
    m.reply(
        `✅ *grupos de reglas actualizados*

` +
        `¡Las reglas del grupo se actualizaron correctamente!
` +
        `Escribe \`${m.prefix}rulesgrup\` para ver.`
    )
}

export { pluginConfig as config, handler }
