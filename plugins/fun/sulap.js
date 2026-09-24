const pluginConfig = {
    name: 'sulap',
    alias: ['magic', 'magictrick'],
    category: 'fun',
    description: "Espectáculo de magia: expulsar a un miembro de forma dramática",
    usage: '.sulap',
    example: '.sulap',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

if (!global.sulapSessions) global.sulapSessions = new Map()

const successLines = [
    "💨 *POOF!* ¡Y... se ha ido!",
    "🌟 ¡La magia está funcionando!~",
    "✨ ¡Registra tu asistencia primero; espera al siguiente turno!",
    "🎪 ¡Se acabó el show! 👏"
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function handler(m, { sock }) {
    await m.react('🎩')

    const sent = await m.reply(`🎩✨ *ESPECTÁCULO DE MAGIA*

` +
            `¿A quién quieres hacer desaparecer?

` +
            `> Responder a este mensaje + mencionar a la persona`)

    global.sulapSessions.set(sent.key.id, {
        admin: m.sender,
        chat: m.chat,
        timestamp: Date.now()
    })

    setTimeout(() => {
        global.sulapSessions.delete(sent.key.id)
    }, 120000)
}

async function replyHandler(m, sock) {
    if (!m.quoted) return false

    const quotedId = m.quoted?.id || m.quoted?.key?.id
    if (!quotedId) return false

    const session = global.sulapSessions.get(quotedId)
    if (!session) return false
    if (session.chat !== m.chat) return false
    if (session.admin !== m.sender) return false

    let targetJid = null
    if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted?.sender && m.quoted.sender !== sock.user?.id) {
        return false
    }

    if (!targetJid) {
        await sock.sendMessage(m.chat, { text: "❌ ¡Menciona a la persona!" }, { quoted: m })
        return true
    }

    global.sulapSessions.delete(quotedId)

    const targetNumber = targetJid.split('@')[0]
    const botNumber = sock.user?.id?.split(':')[0]
    const senderNumber = m.sender.split('@')[0]

    if (targetNumber === botNumber) {
        await sock.sendMessage(m.chat, { text: "🎭 ¡Bot no puede deshacerse de sí mismo!" })
        return true
    }

    if (targetJid === m.sender) {
        await sock.sendMessage(m.chat, { text: "🎭 ¡No puedes perderte!" })
        return true
    }

    try {
        const groupMeta = m.groupMetadata
        const target = groupMeta.participants.find(p =>
            p.jid === targetJid || p.jid?.includes(targetNumber)
        )

        if (!target) {
            await sock.sendMessage(m.chat, { text: "👻 ¡Ese tipo no está en el grupo!" })
            return true
        }

        if (['admin', 'superadmin'].includes(target.admin)) {
            await sock.sendMessage(m.chat, { text: "🛡️ ¡Los administradores son inmunes a la magia!" })
            return true
        }

        await sock.sendMessage(m.chat, {
            text: `🪄 *Prepárate, @${targetNumber}...* ✨`,
            mentions: [targetJid]
        })

        await sleep(2000)

        await sock.groupParticipantsUpdate(m.chat, [targetJid], 'remove')

        const line = successLines[Math.floor(Math.random() * successLines.length)]
        await sock.sendMessage(m.chat, {
            text: `${line}\n\n` +
                `🎯 @${targetNumber} ¡ha desaparecido!
` +
                `🎩 Mago: @${senderNumber}\n\n` +
                `> _El espectáculo terminó~_✨`,
            mentions: [targetJid, m.sender]
        })

    } catch (error) {
        await sock.sendMessage(m.chat, { text: `😅 El ángulo está fallando...

> ${error.message}` })
    }

    return true
}

export { pluginConfig as config, handler, replyHandler }
