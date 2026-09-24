const pluginConfig = {
    name: 'setname',
    alias: ['setnamebot', 'setbotnama'],
    category: 'tools',
    description: "Rename bot profile",
    usage: ".setname <nombre_nuevo>",
    example: '.setname Ourin-AI',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}setname Nuevo nombre del bot\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 25) {
        await m.reply(
            `⚠️ *VALIDACIÓN*

` +
            `El nombre del bot debe ser de 1 a 25 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileName(newName)
        
        await m.reply(
            `✅ *NOMBRE DEL BOT CAMBIADO*\n\n` +
            `> Nombre del bot ahora: *${newName}*`
        )
    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo cambiar el nombre del bot.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
