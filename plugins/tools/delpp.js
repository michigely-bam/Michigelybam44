const pluginConfig = {
    name: 'delpp',
    alias: ['delprofilebot', 'delppbot', 'hapusppbot'],
    category: 'tools',
    description: "Remoción de fotos de perfil de bot",
    usage: '.delpp',
    example: '.delpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ La bota JID no se encontró.`)
            return
        }
        
        await sock.removeProfilePicture(botJid)
        
        await m.reply(
            `✅ *pp bot se ha eliminado*

` +
            `¡La foto de perfil del bot fue eliminada con éxito!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo eliminar la foto del bot.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
