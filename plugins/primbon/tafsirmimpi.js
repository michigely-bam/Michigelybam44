import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'tafsirmimpi',
    alias: ['artimimpi', 'mimpi'],
    category: 'primbon',
    description: "Busca la interpretación de los sueños",
    usage: ".tafsirmimpi <palabras clave>",
    example: '.tafsirmimpi bertemu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const keyword = m.args.join(' ')
    if (!keyword) {
        return m.reply(`🌙 *INTERPRETACIÓN DE SUEÑOS*

> Entra en la palabra clave del sueño

\`Ejemplo: ${m.prefix}tafsirmimpi bertemu\``)
    }
    
    m.react('🌙')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/tafsirmimpi?mimpi=${encodeURIComponent(keyword)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data?.hasil?.length) {
            m.react('❌')
            return m.reply(`❌ *falló*

> No se ha encontrado ninguna interpretación para: ${keyword}`)
        }
        
        const r = data.data
        let response = `🌙 *INTERPRETACIÓN DE SUEÑOS*

`
        response += `> Palabra clave: *${r.keyword}*\n`
        response += `> Encontrado: *${r.total} resultados*

`
        
        r.hasil.slice(0, 10).forEach((h, i) => {
            response += `*${i+1}. ${h.mimpi}*\n> ${h.tafsir}\n\n`
        })
        
        if (r.total > 10) {
            response += `_...y ${r.total - 10} resultados más_`
        }
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
