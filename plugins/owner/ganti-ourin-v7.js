import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-v7.jpg',
    alias: ['gantiourinv7', 'setourinv7'],
    category: 'owner',
    description: "Cambiar las imágenes ourin-v7.jpg",
    usage: ".gantiourinv7 (responde o envía una imagen)",
    example: '.ganti-ourin-v7.jpg',
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
    if (!isImage) return m.reply(`🖼️ *reemplazado por OURIN-V7.JPG*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin-v7.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply("❌ No se pudo download image")
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-v7.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *correcto*

La imagen ourin-v7.jpg ha sido cambiada`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
