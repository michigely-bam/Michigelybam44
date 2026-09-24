import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antiphising',
    alias: ['antiphishing', 'antiscamlink', 'nophising'],
    category: 'group',
    description: "Detectar contenido de phising en grupo",
    usage: '.antiphising <on/off/metode> [kick/remove]',
    example: '.antiphising on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const option = m.text?.toLowerCase()?.trim()

    if (!option) {
        const status = groupData.antiphising || 'off'
        const mode = groupData.antiphisingMode || 'remove'
        return m.reply(
            `🎣 *ᴀɴᴛɪᴘʜɪsɪɴɢ*\n\n` +
            `> Status: *${status.toUpperCase()}*\n` +
            `> Mode: *${mode.toUpperCase()}*\n\n` +
            `> Detección de mensajes de phishing como clic en un enlace, verificación de cuenta, login falso, abreviador sospechoso, URL IP, punycode, y patrones similares.

` +
            `> \`${m.prefix}antiphising on\`\n` +
            `> \`${m.prefix}antiphising off\`\n` +
            `> \`${m.prefix}antiphising método kick\`
` +
            `> \`${m.prefix}antiphising método remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antiphising: 'on' })
        return m.reply('✅ *AntiPhising activado*')
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antiphising: 'off' })
        return m.reply("❌ *AntiPhising se ha desactivado*")
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'kick' })
            return m.reply('✅ *AntiPhising en modo KICK activado*')
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'remove' })
            return m.reply('✅ *AntiPhising en modo DELETE activado*')
        }
        return m.reply("❌ ¡Método inválido! `kick` o `remove`")
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'kick' })
        return m.reply('✅ *AntiPhising en modo KICK activado*')
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'remove' })
        return m.reply('✅ *AntiPhising en modo DELETE activado*')
    }

    return m.reply("❌ Opción inválida! Uso: `on`, `off`, `método kick`, `método remove`")
}

export { pluginConfig as config, handler }
