import { getDatabase } from '../../src/lib/ourin-database.js'
import { isLid, lidToJid, resolveAnyLidToJid } from '../../src/lib/ourin-lid.js'

const pluginConfig = {
    name: 'mutemember',
    alias: ['mutmember', 'silentmember', 'bisukanmember'],
    category: 'group',
    description: "Silencia a un miembro específico (el bot eliminará sus mensajes)",
    usage: ".mutemember <@mención/reply/número>",
    example: '.mutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    if (!raw.includes('@')) raw = raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    return raw
}

async function handler(m, { sock }) {
    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `🔇 *SILENCIAR MIEMBRO*\n\n` +
            `> Silencia a un miembro específico de este grupo.\n` +
            `> El bot eliminará automáticamente sus mensajes.\n\n` +
            `\`Ejemplo:\`\n` +
            `> ${m.prefix}mutemember @user\n` +
            `> ${m.prefix}mutemember 6281234567890\n` +
            `> Responde al mensaje del miembro con ${m.prefix}mutemember`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    if (m.isGroup) {
        const isTargetAdmin = m.groupMetadata?.participants?.some(p => {
            const pJid = (p.id || p.jid || '').replace(/@.+/g, '')
            return pJid === targetNumber && (p.admin === 'admin' || p.admin === 'superadmin')
        })
        if (isTargetAdmin) {
            return m.reply(`❌ *Error*

> No puedes silenciar a un administrador del grupo.`)
        }
    }

    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    const alreadyMuted = mutedMembers.some(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (alreadyMuted) {
        return m.reply(`❌ *Error*

> El miembro @${targetNumber} ya está silenciado.`, { mentions: [targetJid] })
    }

    mutedMembers.push(targetJid)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔇')
    await m.reply(
        `🔇 *MIEMBRO SILENCIADO*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴍᴇᴍʙᴇʀ: @${targetNumber}\n` +
        `┃ 🔇 ᴇsᴛᴀᴅᴏ: \`Silenciado\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${mutedMembers.length}\` miembros silenciados\n` +
        `╰┈┈⬡\n\n` +
        `> Todos los mensajes de este miembro se eliminarán automáticamente
` +
        `> Usa \`${m.prefix}unmutemember\` para quitarle el silencio.`,
        { mentions: [targetJid] }
    )
}

function isMutedMember(groupJid, senderJid, db) {
    const groupData = db.getGroup(groupJid) || {}
    const mutedMembers = groupData.mutedMembers || []
    if (mutedMembers.length === 0) return false

    const senderNumber = senderJid.replace(/@.+/g, '')
    return mutedMembers.some(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === senderNumber || c.endsWith(senderNumber) || senderNumber.endsWith(c)
    })
}

export { pluginConfig as config, handler, isMutedMember }
