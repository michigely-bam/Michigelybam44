import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'spamngl',
    alias: [],
    category: 'tools',
    description: 'Enviar varios mensajes NGL',
    usage: '.spamngl <url> | <texto> | <cantidad>',
    example: '.spamngl https://ngl.link/xxxx | hola | 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.split('|')
    const [ link, kata, jumlah ] = text
    if(!link) return m.reply(`*¿DÓNDE ESTÁ EL ENLACE DE NGL?*
    Ejemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hola | 10`)
    if(!kata) return m.reply(`*FALTA EL MENSAJE*

    Ejemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hola | 10`)
    if(!jumlah) return m.reply(`*FALTA LA CANTIDAD*

    Ejemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hola | 10`)
    if(isNaN(jumlah)) return m.reply(`*LA CANTIDAD DEBE SER UN NÚMERO*

    Ejemplo: \`${m?.prefix}spamngl https://ngl.link/xxxx | hola | 10`)
    m.react('🎴')
    
    try {
        for(let i = 0; i < jumlah; i++) {
            axios.get(`https://api.cuki.biz.id/api/tools/sendngl?apikey=cuki-x&link=${encodeURIComponent(link)}&text=${encodeURIComponent(kata)}`, {
                timeout: 30000
            })
            await new Promise(resolve => setTimeout(resolve, 4000))
        }
        await m.react('✅')
        await sock.sendMessage(m.chat, {
            text: `✅ *DONE*

¡Envió exitosamente un mensaje de spam NGL!
Target: ${link}
Mensaje: ${kata} (${jumlah}x)`
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
