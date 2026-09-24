import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-demote.jpg',
    alias: ['gantiourindemote', 'setourindemote'],
    category: 'owner',
    description: "Cambiar las imágenes ourin-demote.",
    usage: ".gantiourindemote (responde o envía una imagen)",
    example: '.ganti-ourin-demote.jpg',
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
    if (!isImage) return m.reply(`🖼️ *reemplazo de OURIN-DEMOTE.JPG*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin-demote.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply("❌ No se pudo download image")
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-demote.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *correcto*

Las imágenes ourin-demote.jpg han sido reemplazadas`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
