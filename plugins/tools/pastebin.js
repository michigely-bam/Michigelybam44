import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'pastebin',
    alias: ['paste', 'pb'],
    category: 'tools',
    description: "Subir texto a Pastebin",
    usage: '.pastebin <text>',
    example: '.pastebin console.log("Hello World")',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let text = m.args.join(' ')
    
    if (m.quoted?.text) {
        text = m.quoted.text
    }
    
    if (!text) {
        return m.reply(
            `📋 *ᴘᴀsᴛᴇʙɪɴ ᴜᴘʟᴏᴀᴅ*\n\n` +
            `Envía un mensaje de texto a Pastebin.

` +
            `*Modo de uso:*
` +
            `• \`${m.prefix}pastebin <text>\`\n` +
            `• Responder al texto con \`${m.prefix}pastebin\`\n\n` +
            `> Ejemplo: \`${m.prefix}pastebin console.log("Hello")\``
        )
    }
    
    const api_dev_key = 'h9WMT2Mn9QW-qDhvUSc-KObqAYcjI0he'
    const api_paste_code = text.trim()
    const api_paste_name = `Pegar desde ${m.pushName || 'User'} - ${new Date().toLocaleDateString('id-ID')}`
    
    const data = new URLSearchParams({
        api_dev_key,
        api_option: 'paste',
        api_paste_code,
        api_paste_name,
        api_paste_private: '1'
    })
    
    try {
        const res = await axios.post('https://pastebin.com/api/api_post.php', data.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000
        })
        
        const url = res.data
        
        if (url.startsWith('Bad API request')) {
            return m.reply(`❌ *ERROR*\n\n> ${url}`)
        }
        
        await sock.sendMessage(m.chat, {
            text: `✅ *el pastebin fue exitoso*

` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📝 TÍTULO: *${api_paste_name}*\n` +
                `┃ 📊 TAMAÑO: *${text.length} chars*\n` +
                `┃ 🔗 ʟɪɴᴋ: ${url}\n` +
                `╰┈┈⬡\n\n` +
                `> El paste caducará según la configuración de Pastebin.`,
            contextInfo: {
                externalAdReply: {
                    title: 'Pastebin Upload',
                    body: api_paste_name,
                    thumbnailUrl: 'https://pastebin.com/i/facebook.png',
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
        
    } catch (e) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
