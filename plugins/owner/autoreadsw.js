import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autoreadsw',
    alias: ['autoreadstory', 'readstory', 'bacasw'],
    category: 'owner',
    description: 'Lee automáticamente todos los estados/historias de WA',
    usage: '.autoreadsw activar/desactivar',
    example: '.autoreadsw activar',
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
    const action = (m.args?.[0] || '').toLowerCase()
    const current = db.setting('autoReadSW') || { enabled: false }

    if (!action) {
        return m.reply(
            `👁️ *ʟᴇᴄᴛᴜʀᴀ ᴀᴜᴛᴏᴍáᴛɪᴄᴀ ᴅᴇ ᴇsᴛᴀᴅᴏs*\n\n` +
            `> Estado: *${current.enabled ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*\n\n` +
            `*ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ:*\n` +
            `> \`${m.prefix}autoreadsw activar\` — Activar\n` +
            `> \`${m.prefix}autoreadsw desactivar\` — Desactivar`
        )
    }

    if (action === 'activar') {
        db.setting('autoReadSW', { enabled: true })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ʟᴇᴄᴛᴜʀᴀ ᴀᴜᴛᴏᴍáᴛɪᴄᴀ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n` +
            `> El bot leerá automáticamente todos los estados de WA`
        )
    }

    if (action === 'desactivar') {
        db.setting('autoReadSW', { enabled: false })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ʟᴇᴄᴛᴜʀᴀ ᴀᴜᴛᴏᴍáᴛɪᴄᴀ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*`)
    }

    return m.reply(`❌ Usa \`activar\` o \`desactivar\``)
}

export { pluginConfig as config, handler }
