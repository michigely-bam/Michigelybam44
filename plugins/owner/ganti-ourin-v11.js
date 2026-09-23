import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-v11.jpg',
    alias: ['gantiourinv11', 'setourinv11'],
    category: 'owner',
    description: 'Ganti gambar ourin-v11.jpg',
    usage: ".reemplazar -ourin -v11.jpg (reply / enviar imagen)",
    example: '.ganti-ourin-v11.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ OURIN-V11.JPG*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin-v11.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply("❌ No se pudo download image")
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-v11.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Gambar ourin-v11.jpg telah diganti`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }