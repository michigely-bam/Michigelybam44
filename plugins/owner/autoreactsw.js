import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autoreactsw',
    alias: ['autoreaksi', 'reactsw', 'autoreactstory'],
    category: 'owner',
    description: 'Reacciona automáticamente a todos los estados/historias de WA',
    usage: '.autoreactsw activar/desactivar [emoji]',
    example: '.autoreactsw activar 🔥',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const action = (args[0] || '').toLowerCase()
    const emoji = args[1] || '🔥'

    const current = db.setting('autoReactSW') || { enabled: false, emoji: '🔥' }

    if (!action) {
        return m.reply(
            `👁️ *ʀᴇᴀᴄᴄɪóɴ ᴀᴜᴛᴏᴍáᴛɪᴄᴀ ᴀ ᴇsᴛᴀᴅᴏs*\n\n` +
            `> Estado: *${current.enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*\n` +
            `> Emoji: *${current.emoji}*\n\n` +
            `*ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ:*\n` +
            `> \`${m.prefix}autoreactsw activar\` — Activar (emoji predeterminado 🔥)\n` +
            `> \`${m.prefix}autoreactsw activar 😍\` — Activar con un emoji\n` +
            `> \`${m.prefix}autoreactsw desactivar\` — Desactivar`
        )
    }

    if (action === 'activar') {
        db.setting('autoReactSW', { enabled: true, emoji })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ʀᴇᴀᴄᴄɪóɴ ᴀᴜᴛᴏᴍáᴛɪᴄᴀ ᴀ ᴇsᴛᴀᴅᴏs ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n` +
            `> Emoji: *${emoji}*\n` +
            `> El bot reaccionará automáticamente a todos los estados de WA`
        )
    }

    if (action === 'desactivar') {
        db.setting('autoReactSW', { enabled: false, emoji: current.emoji })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ʀᴇᴀᴄᴄɪóɴ ᴀᴜᴛᴏᴍáᴛɪᴄᴀ ᴀ ᴇsᴛᴀᴅᴏs ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*`)
    }

    return m.reply(`❌ Usa \`activar\` o \`desactivar\``)
}

export { pluginConfig as config, handler }
