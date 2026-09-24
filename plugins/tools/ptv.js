import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ptv',
    alias: ['pvideo', 'circlevideo'],
    category: 'tools',
    description: "Enviar un vídeo como un PTV (vídeo circular)",
    usage: '.ptv (reply video)',
    example: '.ptv',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let video = null
    
    if (m.quoted && m.quoted.isVideo) {
        try {
            video = await m.quoted.download()
        } catch (e) {
            return m.reply(`❌ No se puede descargar el video de citado.`)
        }
    } else if (m.isVideo) {
        try {
            video = await m.download()
        } catch (e) {
            return m.reply(`❌ Fallado para descargar vídeo.`)
        }
    }
    
    if (!video) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> Envíe *video* o *contesta el video* y escriba:
` +
            `> \`${m.prefix}ptv\``
        )
    }
    
    await m.reply(`🕕 *CREANDO PTV...*`)
    
    try {
        await sock.sendMessage(m.chat, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        }, { quoted: m })
        
        m.react('✅')
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
