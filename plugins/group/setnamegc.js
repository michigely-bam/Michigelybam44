const pluginConfig = {
    name: 'setnamegc',
    alias: ['setnamegrup', 'setgcname', 'setnamegroup', 'setnamagrup'],
    category: 'group',
    description: "Rename group",
    usage: ".setnamegc Identificar nuevo nombre",
    example: ".Cool Group setnamegc",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}setnamegc Nuevo nombre del grupo\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 100) {
        await m.reply(
            `⚠️ *VALIDACIÓN*

` +
            `El nombre del grupo debe ser de 1 a 100 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateSubject(m.chat, newName)
        
        await m.reply(
            `✅ Cambio de nombre de grupo con éxito *${newName}*`
        )
    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo cambiar el nombre del grupo.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
