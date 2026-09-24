import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup'],
    category: 'group',
    description: "Ban grupo de uso de bot (sólo el propietario puede acceder)",
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isUnban = ['unbanchat', 'unbangroup'].includes(cmd)
    
    try {
        const groupMeta = m.groupMetadata
        const groupName = groupMeta.subject || 'Desconocido'
        const groupData = db.getGroup(m.chat) || {}
        
        if (isUnban) {
            if (!groupData.isBanned) {
                return m.reply(
                    `⚠️ *GRUPO NO VETADO*\n\n` +
                    `Este grupo no está en estado prohibido.
` +
                    `Todos los usuarios pueden usar bot.`
                )
            }
            
            db.setGroup(m.chat, { ...groupData, isBanned: false })
            
            return sock.sendMessage(m.chat, {
                text: `✅ *GRUPO DESBLOQUEADO*\n\n` +
                    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                    `┃ 📛 GRUPO: *${groupName}*\n` +
                    `┃ 📊 estado: *✅ ACTIVO*
` +
                    `┃ 👤 DESBLOQUEADO POR: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈⬡\n\n` +
                    `Todos los miembros ahora pueden volver a usar el bot.`,
                mentions: [m.sender]
            }, { quoted: m })
        }
        
        if (groupData.isBanned) {
            return m.reply(
                `⚠️ *el grupo ya ha sido bloqueado*

` +
                `Este grupo ya está prohibido.
` +
                `Utilice \`.unbanchat\` para abrir el acceso.`
            )
        }
        
        db.setGroup(m.chat, { ...groupData, isBanned: true })
        
        await m.reply(`🚫 *GRUPO BLOQUEADO*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📛 GRUPO: *${groupName}*\n` +
                `┃ 📊 sᴛᴀᴛᴜs: *🔴 BANNED*\n` +
                `┃ 👤 BLOQUEADO POR: @${m.sender.split('@')[0]}\n` +
                `╰┈┈⬡\n\n` +
                `Los miembros habituales no pueden usar bot en este grupo.
` +
                `Sólo el propietario puede usar bot.`, {  mentions: [m.sender] })
        
    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
