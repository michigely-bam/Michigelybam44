import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-otp.jpg',
    alias: ['gantiourinotp', 'setourinotp'],
    category: 'owner',
    description: "Cambiar las imágenes ourin-otp.",
    usage: ".gantiourinotp (responde o envía una imagen)",
    example: '.ganti-ourin-otp.jpg',
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
    if (!isImage) return m.reply(`🖼️ *reemplazado por OURIN-OTP.JPG*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin-otp.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply("❌ No se pudo download image")
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-otp.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *correcto*

Las imágenes ourin-otp.jpg han sido reemplazadas`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
