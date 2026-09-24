import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import { fetchGroupsSafe } from '../../src/lib/ourin-jpm-helper.js'
import fs from 'fs'
import { config } from '../../config.js'
import te from '../../src/lib/ourin-error.js'
let cachedThumb = null
try {
    if (fs.existsSync('./assets/images/ourin.jpg')) {
        cachedThumb = fs.readFileSync('./assets/images/ourin.jpg')
    }
} catch (e) {}

const pluginConfig = {
    name: 'jpmht',
    alias: ['jpmhidetag'],
    category: 'jpm',
    description: "Enviar mensajes a todos los grupos con escondite",
    usage: ".jpmht − Mensaje hecho",
    example: ".jpmht ¡Hola a todos!",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
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
            `📢 *JPM HIDETAG (SERVICIO DE MENSAJERÍA MASIVA)*

` +
            `Sistema de transmisión automática a todo el grupo que está registrado con la etiqueta de todos los miembros (hidetag).

` +
            `*USO:*
` +
            `• *${m.prefix}jpmht <mensaje>* — Enviar una difusión de texto con mención oculta
` +
            `• *${m.prefix}jpmht (Responde foto/video)* — Enviar JPM hidatag con los medios

` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}jpmht ¡Hola a todos! No olviden revisar nuestro canal.\``
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
        
        const allGroups = await fetchGroupsSafe(sock)
        let groupIds = Object.keys(allGroups)
        
        const blacklist = db.setting('jpmBlacklist') || []
        const blacklistedCount = groupIds.filter(id => blacklist.includes(id)).length
        groupIds = groupIds.filter(id => !blacklist.includes(id))
        
        if (groupIds.length === 0) {
            m.react('❌')
            return m.reply(`❌ *falló*

> No se encontró ningún grupo${blacklistedCount > 0 ? ` (${blacklistedCount} grupo sobre -lista negra` : ''}`)
        }
        
        const jedaJpm = db.setting('jedaJpm') || 5000
        
        await m.reply(
            `📢 *ᴊᴘᴍ ʜɪᴅᴇᴛᴀɢ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📝 mensaje: \`${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\`\n` +
            `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : "No"}\`\n` +
            `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${groupIds.length}\` grupo
` +
            `┃ ⏱️ INTERVALO: \`${jedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `> Iniciando JPM con mención oculta...`
        )
        
        global.statusjpm = true
        let successCount = 0
        let failedCount = 0
        
        for (const groupId of groupIds) {
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
            
            try {
                const groupData = allGroups[groupId]
                const mentions = groupData.participants.map(p => p.id || p.jid).filter(Boolean)
                const contextInfo = {
                    mentionedJid: mentions,
                    forwardingScore: 9999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: config.saluran?.id,
                        newsletterName: config.saluran?.name,
                        serverMessageId: 127
                    },
                    externalAdReply: cachedThumb ? {
                                title: '📢 JPM HIDETAG',
                                body: "Mensaje de masas con Hidetag",
                                thumbnail: cachedThumb,
                                sourceUrl: config.saluran?.link || '',
                                mediaType: 1,
                                renderLargerThumbnail: true
                            } : undefined
                }
                if (mediaBuffer) {
                    await sock.sendMessage(groupId, {
                        [mediaType]: mediaBuffer,
                        caption: text,
                        mentions: mentions,
                        contextInfo: contextInfo
                    })
                } else {
                    await sock.sendMessage(groupId, { 
                        text: text,
                        mentions: mentions,
                        contextInfo: contextInfo
                    })
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
            `✅ *jpm Hidetag terminado*

` +
            `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
            `┃ ✅ correcto: \`${successCount}\`\n` +
            `┃ ❌ ERROR: \`${failedCount}\`\n` +
            `┃ 📊 ᴛᴏᴛᴀʟ: \`${groupIds.length}\`\n` +
            `╰┈┈⬡`
        )
        
    } catch (error) {
        delete global.statusjpm
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
