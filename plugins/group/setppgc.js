const pluginConfig = {
    name: 'setppgc',
    alias: ['setprofilegc', 'setppgroup', 'setppgrup'],
    category: 'group',
    description: "Cambiar fotos de perfil de grupo",
    usage: ".setppgc (respuesta a la imagen)",
    example: '.setppgc',
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
            `> Responder a la imagen + \`${m.prefix}setppgc\`\n` +
            `> Envía imágenes + descripción \`${m.prefix}setppgc\``
        )
        return
    }
    try {
        await sock.updateProfilePicture(m.chat, buffer)
        await m.reply(
            `✅ Perfil de grupo foto actualizada con éxito!`
        )
    } catch (error) {
        await m.reply(
            `❌ El fracaso en cambiar las fotos del grupo.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
