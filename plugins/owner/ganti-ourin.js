import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin.jpg',
    alias: ['gantiourin', 'setourin'],
    category: 'owner',
    description: 'Ganti gambar ourin.jpg (thumbnail menu)',
    usage: ".reemplazar -ourin.jpg (reply / enviar imagen)",
    example: '.ganti-ourin.jpg',
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
        return m.reply(`🖼️ *ɢᴀɴᴛɪ ᴏᴜʀɪɴ.ᴊᴘɢ*

> Enviar / respuesta imágenes para reemplazar
> File: assets/images/ourin.jpg`)
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
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*

> Gambar ourin.jpg telah diganti
> Reinicie el bot para ver cambios`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }