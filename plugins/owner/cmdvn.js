import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'cmdvn',
    alias: ['voicecommand', 'vncmd'],
    category: 'owner',
    description: "Activar el comando a través de una nota de voz",
    usage: '.cmdvn <on/off>',
    example: '.cmdvn on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const subCmd = args[0]?.toLowerCase()

    const current = db.setting('cmdVn') || false

    if (!subCmd || subCmd === 'status') {
        const status = current ? '✅ ON' : '❌ OFF'
        return m.reply(
            `🎤 *ᴄᴍᴅ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ*\n\n` +
            `> Estado: *${status}*\n\n` +
            `> \`${m.prefix}cmdvn on\` — Comandos por nota de voz\n` +
            `> \`${m.prefix}cmdvn off\` — Comandos por texto (predeterminado)\n\n` +
            `> Cuando ON, envíe VN con el nombre del comando
` +
            `> Ejemplo: nota de voz "menu" → ejecuta .menu`
        )
    }

    if (subCmd === 'on') {
        db.setting('cmdVn', true)
        return m.reply(
            `✅ *COMANDOS DE VOZ ACTIVADOS*\n\n` +
            `> Envía una nota de voz con el nombre del comando
` +
            `> El bot transcribirá y ejecutará el contenido automáticamente
` +
            `> Ejemplo: nota de voz "menu" → ejecuta .menu`
        )
    }

    if (subCmd === 'off') {
        db.setting('cmdVn', false)
        return m.reply(`❌ Los comandos por nota de voz fueron *desactivados*. Usa comandos de texto normalmente.`)
    }

    return m.reply(`❌ Usa \`${m.prefix}cmdvn on\` o \`${m.prefix}cmdvn off\``)
}

export { pluginConfig as config, handler }
