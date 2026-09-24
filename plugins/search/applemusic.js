import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'applemusic',
    alias: ['amusic', 'am'],
    category: 'search',
    description: "Busca canciones en Apple Music",
    usage: '.applemusic <query>',
    example: '.applemusic Best Friend',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()
    
    if (!query) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}applemusic <query>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}applemusic Best Friend\``
        )
    }
    
    try {
        const res = await axios.get(`https://api.nexray.web.id/search/applemusic?q=${encodeURIComponent(query)}`)
        
        if (!res.data?.result?.length) {
            return m.reply(`❌ No se han encontrado resultados para: ${query}`)
        }
        
        const tracks = res.data.result.slice(0, 5)
        
        let txt = `🍎 *ᴀᴘᴘʟᴇ ᴍᴜsɪᴄ sᴇᴀʀᴄʜ*\n\n`
        txt += `> Query: *${query}*\n\n`                                                                                    
        
        tracks.forEach((t, i) => {
            txt += `*${i + 1}.* \`\`\`${t.title}\`\`\`\n`
            txt += `   ├ 📀 \`${t.subtitle || 'Desconocido'}\`\n`
            txt += `   └ 🔗 \`${t.link}\`\n\n`
        })
        
        return m.reply(txt.trim())
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
