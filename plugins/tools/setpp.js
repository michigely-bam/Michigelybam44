const pluginConfig = {
    name: 'setpp',
    alias: ['setprofilebot', 'setppbot', 'setfotobot'],
    category: 'tools',
    description: "Cambiar la imagen del perfil del bot",
    usage: ".setpp (respuesta a la imagen)",
    example: '.setpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let buffer = null
    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            await m.reply(`❌ Falló en tomar una foto.`)
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ Falló en tomar una foto.`)
            return
        }
    }
    if (!buffer) {
        await m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> Responder a la imagen + \`${m.prefix}setpp\`\n` +
            `> Envía imágenes + descripción \`${m.prefix}setpp\``
        )
        return
    }
    
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ La bota JID no se encontró.`)
            return
        }
        
        await sock.updateProfilePicture(botJid, buffer)
        
        await m.reply(
            `✅ *ᴘᴘ ʙᴏᴛ CAMBIADO*\n\n` +
            `¡Las fotos del perfil del bot se han actualizado con éxito!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo cambiar la foto del bot.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
