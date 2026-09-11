import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'aktifaudiomenu',
    alias: ['audiomenu', 'setaudiomenu', 'toggleaudiomenu'],
    category: 'owner',
    description: 'Activa o desactiva el audio al mostrar el menú',
    usage: '.aktifaudiomenu ya/gak',
    example: '.aktifaudiomenu ya',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = args[0]?.toLowerCase()

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *ᴄᴏɴғɪɢᴜʀᴀᴄɪóɴ ᴅᴇʟ ᴀᴜᴅɪᴏ ᴅᴇʟ ᴍᴇɴú*\n\n` +
            `> Estado: *${current ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `*Modo de uso:*\n` +
            `> \`${m.prefix}aktifaudiomenu ya\` - Activar audio\n` +
            `> \`${m.prefix}aktifaudiomenu gak\` - Desactivar audio`
        )
    }

    if (option === 'ya' || option === 'on' || option === '1' || option === 'aktif') {
        if (current) {
            return m.reply(`⚠️ ¡El audio del menú ya está activo!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`✅ ¡Audio del menú *activado*!\n\n> Ahora, cuando alguien escriba \`.menu\`, aparecerá el audio.`)
    }

    if (option === 'gak' || option === 'off' || option === '0' || option === 'nonaktif') {
        if (!current) {
            return m.reply(`⚠️ ¡El audio del menú ya está inactivo!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`❌ ¡Audio del menú *desactivado*!\n\n> Ahora \`.menu\` no tendrá audio.`)
    }

    return m.reply(`❌ ¡Opción no válida!\n\nUsa: \`ya\` o \`gak\``)
}

export { pluginConfig as config, handler }
