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
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}setdeskgc Deskripsi baru\`\n` +
            `> \`${m.prefix}setdeskgc clear\` - Hapus deskripsi`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
    
    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> Deskripsi maksimal 2048 karakter.`
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
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> Tidak dapat mengubah deskripsi grup.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }