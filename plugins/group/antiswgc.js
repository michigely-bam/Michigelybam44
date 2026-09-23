import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antiswgc',
    alias: ['antiswgroup', 'antiswmentiongc', 'antiswtaggc'],
    category: 'group',
    description: "Detectar tipo de mención del grupo SW o mención del estado ingresado en grupo",
    usage: '.antiswgc <on/off>',
    example: '.antiswgc on',
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

async function handler(m, { db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiswgc || 'off'
        await m.reply(
            `📡 *ᴀɴᴛɪsᴡɢᴄ*\n\n` +
            `> Status: *${status === 'on' ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `> Fitur ini mendeteksi tipe SW group mention seperti:\n` +
            `> • groupStatusMentionMessage\n` +
            `> • groupMentionedMessage\n` +
            `> • statusMentionMessage\n` +
            `> • contextInfo.groupMentions\n\n` +
            `> \`${m.prefix}antiswgc on\`\n` +
            `> \`${m.prefix}antiswgc off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiswgc: 'on' })
        await m.reply("✅ *AntiSWC active*\n\n> La mención del grupo SW se eliminará automáticamente.")
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiswgc: 'off' })
        await m.reply('❌ *AntiSWGC nonaktif*')
        return
    }

    await m.reply("❌ Uso: encendido o apagado")
}

export { pluginConfig as config, handler }
