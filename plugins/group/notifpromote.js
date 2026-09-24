const pluginConfig = {
    name: 'notifpromote',
    alias: [],
    category: 'group',
    description: "Actualizar las notificaciones cuando un administrador está presente",
    usage: '.notifpromote on/off',
    example: '.notifpromote on',
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
        const status = group.notifPromote === true ? "✅ Activo" : "❌ Inactivo"
        return m.reply(`👑 *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ*\n\n> Status: ${status}

*Uso:*
\`${m.prefix}notifpromote on\` - Activa
\`${m.prefix}notifpromote off\` - Desactivación`)
    }
    
    if (args === 'on') {
        group.notifPromote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ ACTIVADO*`)
    }
    
    if (args === 'off') {
        group.notifPromote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *NOTIFICACIÓN DE ASCENSO DESACTIVADA*`)
    }
}

export { pluginConfig as config, handler }
