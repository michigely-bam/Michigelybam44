const pluginConfig = {
    name: 'setdeskgc',
    alias: ['setdesc', 'setdescgc', 'setdeskripsi', 'setdesk'],
    category: 'group',
    description: "Cambiar la descripción del grupo",
    usage: ".setdeskgc < nueva descripción",
    example: ".setdeskgc Group for discussion",
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
    const newDesc = m.text?.trim() || ''
    if (!m.text && m.args?.length === 0) {
        await m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}setdeskgc Nueva descripción\`
` +
            `> \`${m.prefix}setdeskgc clear\` - Eliminación de la descripción`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
    
    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *VALIDACIÓN*

` +
            `Descripción máxima de 2048 caracteres.`
        )
        return
    }
    
    try {
        await sock.groupUpdateDescription(m.chat, descToSet)
        
        if (descToSet) {
            await m.reply(
                `✅ Descripción del grupo con éxito actualizada!`
            )
        } else {
            await m.reply(
                `✅ Descripción del grupo eliminado con éxito!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> No se pudo cambiar la descripción del grupo.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
