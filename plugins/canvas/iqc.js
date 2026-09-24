import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
import moment from 'moment-timezone'

const pluginConfig = {
    name: 'iqc',
    alias: ['iqchat', 'iphonechat'],
    category: 'canvas',
    description: "Crear imágenes de chat de estilo iPhone",
    usage: '.iqc <text>',
    example: ".iqc Hola, bonita",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`📱 *ɪǫᴄ ᴄʜᴀᴛ*

> Escriba texto para chat

\`Ejemplo: ${m.prefix}iqc Hola, bonita\``)
    }
    
    m.react('🕕')
    
    try {
        const now = new Date()
        const time = moment(now).tz("Asia/Jakarta").format("HH:mm")

        await sock.sendMedia(m.chat, `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}`, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
