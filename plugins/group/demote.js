import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'demote',
    alias: ['unadmin', 'turunkan'],
    category: 'group',
    description: 'Turunkan admin menjadi member biasa',
    usage: '.demote @user',
    example: '.demote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        await m.reply(
            `❌ *ᴛᴀʀɢᴇᴛ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
            `> Reply pesan user atau mention!\n` +
            `> Contoh: \`${m.prefix}demote @user\``
        )
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === target)

        if (!participant) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*

> ¡Usuario no encontrado en grupo!`)
            return
        }

        if (!participant.admin) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*

> ¡El usuario no es un administrador!`)
            return
        }

        if (participant.admin === 'superadmin') {
            await m.reply(`❌ *ɢᴀɢᴀʟ*

> ¡No puede demoler el grupo de dueños!`)
            return
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'demote')

        await m.reply(
            `@${target.split('@')[0]} Ya no es un administrador.`,
            { mentions: [target] }
        )

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }