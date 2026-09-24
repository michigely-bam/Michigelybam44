import fs from 'fs'
import { isToxic, handleToxicMessage, DEFAULT_TOXIC_WORDS } from './antitoxic.js'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'notifgantitag',
    alias: ['notiflabel', 'notiftag', 'labeltag'],
    category: 'group',
    description: "Configura las notificaciones de cambios de etiqueta de miembros",
    usage: '.notifgantitag <on/off>',
    example: '.notifgantitag on',
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}
async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const sub2 = args[1]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}
    const currentStatus = groupData.notifLabelChange === true
    if (sub === 'on' && sub2 === 'all') {
        if (!m.isOwner) {
            return m.reply(`❌ ¡Sólo el propietario podría usar esta característica!`)
        }
        m.react('🕕')
        try {
            const groups = await sock.groupFetchAllParticipating()
            const groupIds = Object.keys(groups)
            let count = 0
            for (const groupId of groupIds) {
                db.setGroup(groupId, { notifLabelChange: true })
                count++
            }
            m.react('✅')
            return m.reply(
                `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `> Notificación de cambio de etiqueta activada en *${count}¡* grupo!`
            )
        } catch (err) {
            m.react('☢')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
    if (sub === 'off' && sub2 === 'all') {
        if (!m.isOwner) {
            return m.reply(`❌ ¡Sólo el propietario podría usar esta característica!`)
        }
        m.react('🕕')
        try {
            const groups = await sock.groupFetchAllParticipating()
            const groupIds = Object.keys(groups)
            let count = 0
            for (const groupId of groupIds) {
                db.setGroup(groupId, { notifLabelChange: false })
                count++
            }
            m.react('✅')
            return m.reply(
                `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `> Notificación de cambio de etiqueta desactivada en *${count}¡* grupo!`
            )
        } catch (err) {
            m.react('☢')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
    if (sub === 'on') {
        if (currentStatus) {
            return m.reply(
                `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
                `> Status: *✅ ON*\n` +
                `Las notificaciones de cambio de etiqueta ya están activas en este grupo.

` +
                `Usa \`${m.prefix}notifgantitag off\` para desactivar._`
            )
        }
        db.setGroup(m.chat, { notifLabelChange: true })
        return m.reply(
            `✅ *NOTIFICACIONES DE ETIQUETAS ACTIVADAS*\n\n` +
            `¡Notificación de cambio de etiqueta de miembro ha sido activada!
` +
            `El bot se lo notificará cuando haya un miembro que haya sido etiquetado.

` +
            `_Exemplo: Admin añade la etiqueta "VIP" a los miembros_`
        )
    }
    if (sub === 'off') {
        if (!currentStatus) {
            return m.reply(
                `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
                `> Status: *❌ OFF*\n` +
                `Las notificaciones de cambio de etiqueta ya están inactivas en este grupo.

` +
                `Usa \`${m.prefix}notifgantitag on\` para activar._`
            )
        }
        db.setGroup(m.chat, { notifLabelChange: false })
        return m.reply(
            `❌ *NOTIFICACIONES DE ETIQUETAS DESACTIVADAS*\n\n` +
            `La notificación de cambio de etiqueta de miembro se ha desactivado con éxito.`
        )
    }
    m.reply(
        `🏷️ *NOTIFICACIÓN DE CAMBIO DE ETIQUETA*\n\n` +
        `> Status: *${currentStatus ? '✅ ON' : '❌ OFF'}*\n\n` +
        `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
        `> \`${m.prefix}notifgantitag on\` → Activa
` +
        `> \`${m.prefix}notifgantitag off\` → Desactiva
` +
        `> \`${m.prefix}notifgantitag on all\` → Global ON (owner)\n` +
        `> \`${m.prefix}notifgantitag off all\` → Global OFF (owner)\n\n` +
        `> 📋 *Esta función nos dirá cuándo:*
` +
        `> • Admin añade etiquetas a los miembros
` +
        `> • El administrador elimina los etiquetas de los miembros
` +
        `> • La etiqueta del miembro cambió`
    )
}
async function handleLabelChange(msg, sock) {
    try {
        const db = getDatabase()
        const protocolMessage = msg.message?.protocolMessage
        if (!protocolMessage) return false
        if (protocolMessage.type !== 30) return false
        const memberLabel = protocolMessage.memberLabel
        if (!memberLabel) return false
        const groupJid = msg.key.remoteJid
        if (!groupJid?.endsWith('@g.us')) return false
        const groupData = db.getGroup(groupJid) || {}
        const participant = msg.key.participant || msg.participant || 'Desconocido'
        const label = memberLabel.label || ''
        if (groupData.antitoxic && label && label.trim()) {
            try {
                const toxicWords = groupData.toxicWords || DEFAULT_TOXIC_WORDS
                const toxicCheck = isToxic(label, toxicWords)
                if (toxicCheck.toxic) {
                    await sock.sendText(groupJid, `Hei @${participant.split('@')[0]}, ¡Tu etiqueta contiene la palabra tóxica!`, null, {
                        mentions: [participant],
                        contextInfo: {
                            mentionedJid: [participant],
                            forwardingScore: 99,
                            isForwarded: true,
                            externalAdReply: {
                                mediaType: 1,
                                mediaUrl: null,
                                sourceUrl: null,
                                title: "LABEL WARNING",
                                body: null,
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                renderLargerThumbnail: true,
                            }
                        },
                    })
                    return true
                }
            } catch {}
        }
        if (groupData.notifLabelChange !== true) return false
        let groupMeta = null
        try {
            groupMeta = await sock.groupMetadata(groupJid)
        } catch {}
        let notifText = ''
        if (label && label.trim()) {
            notifText = `🎉 @${participant.split('@')[0]} ha cambiado la etiqueta a *${label}*`
        } else {
            notifText = `🥗 @${participant.split('@')[0]} ha eliminado la etiqueta`
        }
        console.log(notifText)
        await sock.sendText(groupJid, notifText, null, {
            mentions: [participant],
            contextInfo: {
                mentionedJid: [participant],
                forwardingScore: 99,
                isForwarded: true,
                externalAdReply: {
                    mediaType: 1,
                    mediaUrl: null,
                    sourceUrl: null,
                    title: "LABEL WARNING",
                    body: null,
                    thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                    renderLargerThumbnail: true,
                }
            },
        })
        return true
    } catch (error) {
        console.error('[NotifLabelChange] Error:', error.message)
        return false
    }
}
export { pluginConfig as config, handler, handleLabelChange }
