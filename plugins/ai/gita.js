import axios from 'axios'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'gita',
    alias: ['gitagpt', 'bhagavadgita'],
    category: 'ai',
    description: "Chat con Gita GPT (Bhagavad Gita IA)",
    usage: '.gita <pertanyaan>',
    example: '.gita What is dharma?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`📿 *ɢɪᴛᴀ ɢᴘᴛ*

> Introduzca la pregunta

\`Contoh: ${m.prefix}gita What is dharma?\``)
    }
    
    m.react('🕕')
    
    try {
        const url = `https://api.nexray.web.id/ai/gitagpt?text=${encodeURIComponent(text)}`
        const data = await f(url)
        
        const content = data.result
        
        m.react('✅')
        await m.reply(`${content?.trim()}`)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }