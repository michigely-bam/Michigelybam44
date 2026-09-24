import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ourin-large',
    alias: ['setourinlarge', 'gantiourinlarge'],
    category: 'owner',
    description: "Preset: Cambiar la imagen de ourin.jpg, y ourin-v7 a ourin-v11.jpg a la vez",
    usage: ".gantiourinlarge (responde o envía una imagen)",
    example: '.ourin-large',
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
        return m.reply(`🖼️ *ᴏᴜʀɪɴ ʟᴀʀɢᴇ ᴘʀᴇsᴇᴛ*

> Enviar / responder a la imagen para reemplazar al gran grupo de fotos (ourin.jpg, ourin-v7.jpg s / d ourin-v11.jpg) de inmediato.
> Asegúrate de que la relación de imagen es como quiere.`)
    }
    
    await m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.react('❌')
            return m.reply(`❌ No se pudo download image`)
        }
        
        const targetImages = [
            'ourin.jpg',
            'ourin-v7.jpg',
            'ourin-v8.jpg',
            'ourin-v9.jpg',
            'ourin-v10.jpg',
            'ourin-v11.jpg'
        ]
        
        const assetsDir = path.join(process.cwd(), 'assets', 'images')
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true })
        }
        
        for (const imgName of targetImages) {
            const targetPath = path.join(assetsDir, imgName)
            fs.writeFileSync(targetPath, buffer)
        }
        
        await m.react('✅')
        m.reply(`✅ *correcto*

> Foto bundle *ourin-large* Es un éxito remplazado en el tiempo.
> Incluye: ${targetImages.join(', ')}
> Reinicie el bot si la imagen no cambia al instante.`)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
