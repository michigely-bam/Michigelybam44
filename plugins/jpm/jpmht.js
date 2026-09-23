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
    example: '.jpmht Halo semuanya!',
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
            return m.reply(`❌ *ᴍᴏᴅᴇ ᴛɪᴅᴀᴋ sᴇsᴜᴀɪ*

> JPM sólo está disponible en modo MD

\`${m.prefix}botmode md\``)
        }
    }
    
    const text = m.fullArgs?.trim() || m.text?.trim()
    if (!text) {
        return m.reply(
            `📢 *JPM HIDETAG (JASA PESAN MASSAL)*\n\n` +
            `Sistem broadcast otomatis ke seluruh grup yang terdaftar dengan tag semua member (hidetag).\n\n` +
            `*PENGGUNAAN:*\n` +
            `• *${m.prefix}jpmht <pesan>* — Mengirim JPM hidetag teks biasa\n` +
            `• *${m.prefix}jpmht (reply foto/video)* — Mengirim JPM hidetag dengan media\n\n` +
            `*CONTOH:*\n` +
            `> \`${m.prefix}jpmht Halo semuanya! Jangan lupa cek channel kita ya.\``
        )
    }
    
    if (global.statusjpm) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*

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
            return m.reply(`❌ *ɢᴀɢᴀʟ*

> No se encontró ningún grupo${blacklistedCount > 0 ? ` (${blacklistedCount} grupo sobre -lista negra` : ''}`)
        }
        
        const jedaJpm = db.setting('jedaJpm') || 5000
        
        await m.reply(
            `📢 *ᴊᴘᴍ ʜɪᴅᴇᴛᴀɢ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📝 ᴘᴇsᴀɴ: \`${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\`\n` +
            `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : 'Tidak'}\`\n` +
            `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${groupIds.length}\` grup\n` +
            `┃ ⏱️ ᴊᴇᴅᴀ: \`${jedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `> Memulai JPM hidetag...`
        )
        
        global.statusjpm = true
        let successCount = 0
        let failedCount = 0
        
        for (const groupId of groupIds) {
            if (global.stopjpm) {
                delete global.stopjpm
                delete global.statusjpm
                
                await m.reply(
                    `⏹️ *ᴊᴘᴍ ᴅɪʜᴇɴᴛɪᴋᴀɴ*\n\n` +
                    `> ✅ Berhasil: \`${successCount}\`\n` +
                    `> ❌ Gagal: \`${failedCount}\``
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
            `✅ *ᴊᴘᴍ ʜɪᴅᴇᴛᴀɢ sᴇʟᴇsᴀɪ*\n\n` +
            `╭┈┈⬡「 📊 *ʜᴀsɪʟ* 」\n` +
            `┃ ✅ ʙᴇʀʜᴀsɪʟ: \`${successCount}\`\n` +
            `┃ ❌ ɢᴀɢᴀʟ: \`${failedCount}\`\n` +
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