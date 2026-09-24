import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'resetlinkgc',
    alias: ['resetlink', 'revokelink', 'newlink'],
    category: 'group',
    description: "Grupo de reasentamiento invitan a los enlaces",
    usage: '.resetlinkgc',
    example: '.resetlinkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🔄')
    
    try {
        await sock.groupRevokeInvite(m.chat)
        
        m.react('✅')
        m.reply(`✅ *el enlace del grupo se rediseñó*
Los enlaces de grupo antiguo están fuera de orden.
Usa \`${m.prefix}linkgc\` para conseguir un nuevo enlace.`)
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }