import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: ['block', 'blokir'],
    alias: [],
    category: 'owner',
    description: "Número de bloque WhatsApp",
    usage: ".block <número/respuesta/mención>",
    example: '.block 628xxx',
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
            "> `.block 628xxx` — Bloquear a través del número\n" +
            "> `.block` (respondiendo a los mensajes) — Bloquear el remitente\n" +
            "> `.block @mention` — Bloques mencionados\n" +
            "> `.block` (en el chat privado) — Bloquear este usuario"
        )
    }

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetJid === botJid) {
        return m.reply("❌ No puedo bloquear el número del bot.")
    }

    try {
        await sock.updateBlockStatus(targetJid, 'block')
        await m.react('🚫')
        return m.reply(
            `🚫 *NÚMERO BLOQUEADO*\n\n` +
            `> Target: @${targetJid.split('@')[0]}\n` +
            `> Utilice \`.unblock\` para abrir el bloqueo`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
