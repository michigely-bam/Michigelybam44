import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'linesticker',
    alias: ['linepack', 'line'],
    category: 'sticker',
    description: 'Download sticker pack LINE',
    usage: '.linesticker <url>',
    example: '.linesticker https://store.line.me/stickershop/product/9801/en',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 25,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.args?.[0]?.trim()
    
    if (!url || !url.includes('store.line.me')) {
        return m.reply(
            `🎨 *ʟɪɴᴇ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ*\n\n` +
            `> Download LINE sticker pack\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ ${m.prefix}linesticker <url>\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `*CÓMO OBTENER LA URL:*\n` +
            `> 1. Abre https://store.line.me
` +
            `> 2. Elige un paquete de stickers
` +
            `> 3. Copiar URL desde el navegador

` +
            `*EJEMPLO:*\n` +
            `> ${m.prefix}linesticker https://store.line.me/stickershop/product/9801/en`
        )
    }
    
    await m.react('🕕')
    
    try {
        const apikey = config.APIkey?.neoxr
        if (!apikey) {
            await m.react('❌')
            return m.reply(`❌ Key Neoxr API no se encuentra en config!`)
        }
        
        const apiUrl = `https://api.neoxr.eu/api/linesticker?url=${encodeURIComponent(url)}&apikey=${apikey}`
        const res = await axios.get(apiUrl, { timeout: 60000 })
        
        if (!res.data?.status || !res.data?.data) {
            await m.react('❌')
            return m.reply(`❌ ¡No se pudo retrieve stickers from the URL!`)
        }
        
        const data = res.data.data
        const title = data.title || 'LINE Sticker'
        const author = data.author || 'Desconocido'
        const isAnimated = data.animated || false
        
        const stickerUrls = isAnimated && data.sticker_animation_url?.length
            ? data.sticker_animation_url
            : data.sticker_url || []
        
        if (!stickerUrls.length) {
            await m.react('❌')
            return m.reply(`❌ ¡No hay pegatinas encontradas!`)
        }
        
        await m.reply(
            `🎨 *ʟɪɴᴇ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ*\n\n` +
            `╭┈┈⬡「 📦 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 *Title:* ${title}\n` +
            `┃ 👤 *Author:* ${author}\n` +
            `┃ 🎬 *Animated:* ${isAnimated ? 'Ya' : "No"}\n` +
            `┃ 📊 *Total:* ${stickerUrls.length}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> 🕕 Enviando stickers...`
        )
        
        const maxStickers = Math.min(stickerUrls.length, 10)
        const packname = title
        const packAuthor = author
        
        let sent = 0
        for (let i = 0; i < maxStickers; i++) {
            try {
                const response = await axios.get(stickerUrls[i], {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                const buffer = Buffer.from(response.data)
                
                if (isAnimated) {
                    await sock.sendVideoAsSticker(m.chat, buffer, m, { packname, author: packAuthor })
                } else {
                    await sock.sendImageAsSticker(m.chat, buffer, m, { packname, author: packAuthor })
                }
                sent++
                await new Promise(r => setTimeout(r, 600))
            } catch (e) {
                console.error('[LineSticker] Sticker error:', e.message)
            }
        }
        
        if (sent > 0) {
            await m.react('✅')
            await m.reply(`✅ Enviado con éxito ${sent}/${stickerUrls.length} sticker`)
        } else {
            await m.react('☢')
            await m.reply(`❌ No se pudo send stickers`)
        }
        
    } catch (error) {
        console.error('[LineSticker] Error:', error.message)
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
