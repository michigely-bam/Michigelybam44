import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-promote.jpg',
    alias: ['gantiourinpromote', 'setourinpromote'],
    category: 'owner',
    description: "Cambiar las imágenes ourin-promote.",
    usage: ".gantiourinpromote (responde o envía una imagen)",
    example: '.ganti-ourin-promote.jpg',
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
    if (!isImage) return m.reply(`🖼️ *reemplazado por OURIN-PROMOTE.JPG*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin-promote.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply("❌ No se pudo download image")
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-promote.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *correcto*

La imagen ourin-promote.jpg ha sido cambiada`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
