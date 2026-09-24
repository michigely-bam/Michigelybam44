import config from '../../config.js'
import { f } from './../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'emojimix',
    alias: ['mixemoji', 'emix'],
    category: 'sticker',
    description: "Combinar 2 emojis en uno",
    usage: '.emojimix <emoji1><emoji2>',
    example: '.emojimix 😂🔥',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim()
    
    if (!text) {
        return m.reply(
            `🎭 *ᴇᴍᴏᴊɪ ᴍɪx*\n\n` +
            `> Combina 2 emojis en uno

` +
            `> Ejemplo: \`${m.prefix}emojimix 😂🔥\``
        )
    }
    
    const emojiRegex = /\p{Extended_Pictographic}/gu
    const emojis = text.match(emojiRegex)
    
    if (!emojis || emojis.length < 2) {
        return m.reply(`❌ ¡Pon al menos 2 emojis!

Ejemplo: ${m.prefix}emojimix 😂🔥`)
    }
    
    const emoji1 = emojis[0]
    const emoji2 = emojis[1]
    
    m.react('🕕')
    
    try {
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`
        
        const data = await f(apiUrl)
        
        if (!data.results || data.results.length === 0) {
            return m.reply(`❌ ¡La combinación de emojis no se encuentra!

Prueba otro emoji.`)
        }
        
        const imageUrl = data.results[0].url
        
        await sock.sendImageAsSticker(m.chat, imageUrl, m, {
            packname: config.sticker.packname,
            author: config.sticker.author
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
