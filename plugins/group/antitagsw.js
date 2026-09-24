const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: "Activar / deshabilitar el estado anti-tag en grupo",
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ sᴇᴛᴛɪɴɢs*\n\n` +
            `> Status: *${status === 'on' ? "✅ Activo" : "❌ Inactivo"}*\n\n` +
            `> Esta característica elimina los mensajes de etiqueta de estado
` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Activa
` +
            `> \`${m.prefix}antitagsw off\` → Desactiva`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *antitagsw activo*

` +
            `¡Anti-etiqueta de estado ha sido activada!
` +
            `El mensaje de la etiqueta de estado se eliminará automáticamente.`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *antitagsw inactivo*

` +
            `El antietiqueta de estado se ha desactivado con éxito.`
        )
        return
    }

    await m.reply(
        `❌ *OPCIÓN NO VÁLIDA*\n\n` +
        `> Utilice: en o fuera`
    )
}

export { pluginConfig as config, handler }
