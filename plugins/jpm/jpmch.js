import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import config from '../../config.js'
import { getBinaryNodeChild } from 'ourin'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'
let cachedThumb = null
try {
    if (fs.existsSync('./assets/images/ourin.jpg')) {
        cachedThumb = fs.readFileSync('./assets/images/ourin.jpg')
    }
} catch (e) {}
const pluginConfig = {
    name: 'jpmch',
    alias: ['jpmchannel'],
    category: 'jpm',
    description: "Enviar un mensaje a todos los canales de WhatsApp",
    usage: '.jpmch <mensaje>',
    example: ".jpmch ¡Hola a todos!",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

/**
 Fetch todos los canales suscritos (de sus inibaileys)
 * @param {Object} sock - Socket Baileys
 *@returns {Promise<Object>} Lista de canales
 */
async function fetchAllSubscribedChannels(sock) {
    const data = {}
    const encoder = new TextEncoder()
    const queryIds = ['6388546374527196']
    
    for (const queryId of queryIds) {
        try {
            const result = await sock.query({
                tag: 'iq',
                attrs: {
                    id: sock.generateMessageTag(),
                    type: 'get',
                    xmlns: 'w:mex',
                    to: '@s.whatsapp.net',
                },
                content: [
                    {
                        tag: 'query',
                        attrs: { 'query_id': queryId },
                        content: encoder.encode(JSON.stringify({
                            variables: {}
                        }))
                    }
                ]
            })
            const child = getBinaryNodeChild(result, 'result')
            if (!child?.content) continue
            const parsed = JSON.parse(child.content.toString())
            const newsletters = parsed?.data?.['xwa2_newsletter_subscribed'] 
                || parsed?.data?.['newsletter_subscribed']
                || parsed?.data?.['subscribed']
                || []
            
            if (newsletters.length > 0) {

                for (const ch of newsletters) {
                    if (ch.id) {
                        data[ch.id] = {
                            id: ch.id,
                            name: ch.thread_metadata?.name?.text || ch.name || 'Desconocido',
                            subscribers: ch.thread_metadata?.subscribers_count || 0
                        }
                    }
                }
                break
            }
        } catch (e) {

            continue
        }
    }
    
    return data
}


async function handler(m, { sock }) {
    const db = getDatabase()
    
    if (m.isGroup) {
        const groupMode = getGroupMode(m.chat, db)
        if (groupMode !== 'md' && groupMode !== 'all') {
            return m.reply(`❌ *modo no es adecuado*

> JPM sólo está disponible en modo MD

\`${m.prefix}botmode md\``)
        }
    }
    
    const text = m.fullArgs?.trim() || m.text?.trim()
    if (!text) {
        return m.reply(
            `📢 *JPM CANAL (SERVICIO DE MENSAJERÍA MASIVA)*

` +
            `Sistema de transmisión automática a todos los canales de WhatsApp que se suscriben a este bot.

` +
            `*USO:*
` +
            `• *${m.prefix}jpmch <mensaje>* — Enviar una difusión de texto a los canales
` +
            `• *${m.prefix}jpmch (Responde foto/video)* — Enviar JPM medios a los canales

` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}jpmch ¡Hola a todos! Sigan nuestras últimas novedades.\``
        )
    }
    
    if (global.statusjpm) {
        return m.reply(`❌ *falló*

> JPM corriendo. \`${m.prefix}stopjpm\` Parar.`)
    }
    
    m.react('📢')
    
    try {
        let mediaBuffer = null
        let mediaType = null
        const qmsg = m.quoted || m
        
        if (qmsg.isImage) {
            try {
                mediaBuffer = await qmsg.download()
                mediaType = 'image'
            } catch (e) {}
        } else if (qmsg.isVideo) {
            try {
                mediaBuffer = await qmsg.download()
                mediaType = 'video'
            } catch (e) {}
        }
        
        let channels = {}
        try {
            channels = await fetchAllSubscribedChannels(sock)
        } catch (e) {
            m.react('☢')
            m.reply(te(m.prefix, m.command, m.pushName))
        }
        
        const channelIds = Object.keys(channels)
        
        if (channelIds.length === 0) {
            m.react('❌')
            return m.reply(`❌ *falló*

> No hay canal encontrado ni bot todavía subscribir ningún canal`)
        }

        const jedaJpm = db.setting('jedaJpm') || 5000
        
        await m.reply(
            `📢 *ᴊᴘᴍ ᴄʜᴀɴɴᴇʟ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📝 mensaje: \`${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\`\n` +
            `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : "No"}\`\n` +
            `┃ 📺 ᴛᴀʀɢᴇᴛ: \`${channelIds.length}\` channel\n` +
            `┃ ⏱️ INTERVALO: \`${jedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `> Iniciando JPM en todos los canales...`
        )
        
        global.statusjpm = true
        let successCount = 0
        let failedCount = 0
        
        for (const chId of channelIds) {
            const chName = channels[chId]?.name || chId

            if (global.stopjpm) {
                delete global.stopjpm
                delete global.statusjpm
                
                await m.reply(
                    `⏹️ *ᴊᴘᴍ DETENIDO*\n\n` +
                    `> ✅ Correcto: \`${successCount}\`\n` +
                    `> ❌ Falló: \`${failedCount}\``
                )
                return
            }

            let contextInfo = {}
            try {
                contextInfo = {
                    isForwarded: true,
                    forwardingScore: 99,
                    forwardedNewsletterMessageInfo: {
                        newsletterName: config.saluran?.name || config.bot?.name,
                        newsletterJid: config.saluran?.id || '',
                    }
                }
                
                if (cachedThumb) {
                    contextInfo.externalAdReply = {
                        title: '📢 JPM CHANNEL',
                        body: "Mensaje de radiodifusión",
                        thumbnail: cachedThumb,
                        mediaType: 1,
                        sourceUrl: config.saluran?.link || '',
                        renderLargerThumbnail: true,
                    }
                }
            } catch (e) {}
            
            try {
                if (mediaBuffer) {
                    await sock.sendMessage(chId, {
                        [mediaType]: mediaBuffer,
                        caption: text,
                        contextInfo
                    })
                } else {
                    await sock.sendMessage(chId, { text: text, contextInfo })
                }

                successCount++
            } catch (err) {

                failedCount++
            }
            
            await new Promise(resolve => setTimeout(resolve, jedaJpm))
        }
        
        delete global.statusjpm
        
        m.react('✅')
        await m.reply(
            `✅ *jpm canal terminado*

` +
            `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
            `┃ ✅ correcto: \`${successCount}\`\n` +
            `┃ ❌ ERROR: \`${failedCount}\`\n` +
            `┃ 📊 ᴛᴏᴛᴀʟ: \`${channelIds.length}\`\n` +
            `╰┈┈⬡`
        )
        
    } catch (error) {
        delete global.statusjpm
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
