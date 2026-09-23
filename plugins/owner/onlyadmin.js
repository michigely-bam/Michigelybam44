import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'onlyadmin',
    alias: ['selfadmin', 'publicadmin', 'adminonly'],
    category: 'owner',
    description: "Sólo el administrador del grupo puede acceder al comando bot",
    usage: '.onlyadmin on/off',
    example: '.onlyadmin on',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    const cmd = m.command.toLowerCase()
    const current = db.setting('onlyAdmin') || false

    if (cmd === 'selfadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply("❌ *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Bot es accesible para todos")
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ ✅ Admin grup\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ❌ Member biasa\n' +
            '╰┈┈⬡\n\n' +
            '> Gunakan `.onlyadmin off` untuk menonaktifkan'
        )
    }

    if (cmd === 'publicadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply("❌ *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Bot es accesible para todos")
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ ✅ Admin grup\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ✅ Private chat (semua)\n' +
            '┃ ❌ Member biasa di grup\n' +
            '╰┈┈⬡\n\n' +
            '> Gunakan `.onlyadmin off` untuk menonaktifkan'
        )
    }

    if (!args || args === 'status') {
        return m.reply(
            `🔒 *ᴏɴʟʏᴀᴅᴍɪɴ*\n\n` +
            `> Status: ${current ? '✅ Aktif' : '❌ Nonaktif'}\n\n` +
            `*Penggunaan:*\n` +
            `> \`.onlyadmin on\` — Aktifkan\n` +
            `> \`.onlyadmin off\` — Nonaktifkan\n\n` +
            `_Hanya admin grup, owner, dan private chat yang bisa akses bot_`
        )
    }

    if (args === 'on') {
        if (current) return m.reply("⚠️ Sólo Admin está activo.")
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ ✅ Admin grup\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ✅ Private chat (semua)\n' +
            '┃ ❌ Member biasa di grup\n' +
            '╰┈┈⬡'
        )
    }

    if (args === 'off') {
        if (!current) return m.reply("⚠️ Sólo Admin está deshabilitado.")
        db.setting('onlyAdmin', false)
        await m.react('❌')
        return m.reply("❌ *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Bot es accesible para todos")
    }

    return m.reply("❌ Discusión inválida. `on` atau `off`")
}

export { pluginConfig as config, handler }