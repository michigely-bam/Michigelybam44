const pluginConfig = {
    name: 'setpp',
    alias: ['setprofilebot', 'setppbot', 'setfotobot'],
    category: 'tools',
    description: 'Mengubah foto profil bot',
    usage: '.setpp (reply gambar)',
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
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> Reply gambar + \`${m.prefix}setpp\`\n` +
            `> Kirim gambar + caption \`${m.prefix}setpp\``
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
            `✅ *ᴘᴘ ʙᴏᴛ ᴅɪᴜʙᴀʜ*\n\n` +
            `> Foto profil bot berhasil diperbarui!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> Tidak dapat mengubah foto bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }