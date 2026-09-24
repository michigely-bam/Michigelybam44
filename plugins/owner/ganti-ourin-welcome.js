import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-welcome.jpg',
    alias: ['gantiwelcome', 'setourinwelcome'],
    category: 'owner',
    description: "Cambiar la imagen ourin-welcome.jpg (tumbnail welcome)",
    usage: ".gantiwelcome (responde o envía una imagen)",
    example: '.ganti-ourin-welcome.jpg',
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
    
    if (!isImage) {
        return m.reply(`🖼️ *sustituye ourin-welcome.jpg*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin-welcome.jpg`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ No se pudo download image`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-welcome.jpg')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(`✅ *correcto*

La imagen ourin-welcome.jpg ha sido cambiada`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
