import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: ['unblock', 'unblocknomor'],
    alias: [],
    category: 'owner',
    description: "Desbloquear el número de WhatsApp",
    usage: ".unblock <número/respuesta/mención>",
    example: '.unblock 628xxx',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.mentionedJid?.length > 0) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted) {
        targetJid = m.quoted.sender || m.quoted.participant
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        if (!num) return m.reply("❌ Número inválido.")
        targetJid = num + '@s.whatsapp.net'
    } else if (!m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid) {
        return m.reply(
            '⚠️ *MODO DE USO*\n\n' +
            "> `.unblock 628xxx` — Desbloquear a través del número\n" +
            "> `.unblock` (responde a un mensaje) — Desbloquear al remitente\n" +
            "> `.unblock @mention` — Unblock mencionado\n" +
            "> `.unblock` (en chat privado) — Desbloquear a este usuario"
        )
    }

    try {
        await sock.updateBlockStatus(targetJid, 'unblock')
        await m.react('✅')
        return m.reply(
            `✅ *NÚMERO DESBLOQUEADO*\n\n` +
            `> Target: @${targetJid.split('@')[0]}`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
