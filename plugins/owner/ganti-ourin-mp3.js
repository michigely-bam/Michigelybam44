import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin.mp3',
    alias: ['gantiourinaudio', 'setourinaudio'],
    category: 'owner',
    description: "Cambiar el audio ourin.mp3",
    usage: ".gantiourinaudio (responde o envía un audio)",
    example: '.ganti-ourin.mp3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    
    if (!isAudio) {
        return m.reply(`🎵 *reemplazado por ourin.mp3*

> Enviar / respuesta audio para reemplazar
> File: assets/audio/ourin.mp3`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ No se pudo download audio`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'audio', 'ourin.mp3')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(`✅ *correcto*

> Audio ourin.mp3 ha sido reemplazado`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
