const pluginConfig = {
    name: 'notifdemote',
    alias: [],
    category: 'group',
    description: "Toggle notificaciones cuando algo se elimina del administrador",
    usage: '.notifdemote on/off',
    example: '.notifdemote on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Sólo administración de grupo puede utilizar esta característica`)
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifDemote === true ? "✅ Activo" : "❌ Inactivo"
        return m.reply(`👤 *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ*\n\n> Status: ${status}

*Uso:*
\`${m.prefix}notifdemote on\` - Activa
\`${m.prefix}notifdemote off\` - Desactivación`)
    }
    
    if (args === 'on') {
        group.notifDemote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ ACTIVADO*`)
    }
    
    if (args === 'off') {
        group.notifDemote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *NOTIFICACIÓN DE DESCENSO DESACTIVADA*`)
    }
}

export { pluginConfig as config, handler }
