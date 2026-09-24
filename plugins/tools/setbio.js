const pluginConfig = {
    name: 'setbio',
    alias: ['setbiobot', 'setstatus', 'setabout'],
    category: 'tools',
    description: "Cambiar la bio/status del bot",
    usage: ".setbio Identificar nuevo bio",
    example: '.setbio Bot WhatsApp by Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newBio = m.text?.trim()
    
    if (!newBio && m.args?.length === 0) {
        await m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}setbio Nueva biografía del bot\`
` +
            `> \`${m.prefix}setbio clear\` - Eliminación de la bio`
        )
        return
    }
    
    const bioToSet = newBio?.toLowerCase() === 'clear' ? '' : (newBio || '')
    
    if (bioToSet.length > 139) {
        await m.reply(
            `⚠️ *VALIDACIÓN*

` +
            `Biografía máxima de 139 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileStatus(bioToSet)
        
        if (bioToSet) {
            await m.reply(
                `✅ *ʙɪᴏ ʙᴏᴛ CAMBIADO*\n\n` +
                `> Bio bot ahora:
` +
                `> _${bioToSet}_`
            )
        } else {
            await m.reply(
                `✅ *bio bot eliminado*

` +
                `¡Biobot fue eliminado con éxito!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo cambiar la biografía del bot.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
