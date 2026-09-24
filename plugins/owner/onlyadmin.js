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
            return m.reply("❌ *onlyadmin inactivo*\n\n> Bot es accesible para todos")
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *SOLO ADMINISTRADORES ACTIVADO*\n\n' +
            "╭┈┈⬡「 🔒 *ACCESO* 」\n" +
            "┃ ✅ Admin del grupo\n" +
            '┃ ✅ Owner bot\n' +
            "┃ ❌ Miembro normal\n" +
            '╰┈┈⬡\n\n' +
            "> Utilice `.onlyadmin off` para desactivar"
        )
    }

    if (cmd === 'publicadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply("❌ *onlyadmin inactivo*\n\n> Bot es accesible para todos")
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *SOLO ADMINISTRADORES ACTIVADO*\n\n' +
            "╭┈┈⬡「 🔒 *ACCESO* 」\n" +
            "┃ ✅ Admin del grupo\n" +
            '┃ ✅ Owner bot\n' +
            "┃ ✅ Chat privado (todos)\n" +
            "┃ ❌ Miembros habituales en el grupo\n" +
            '╰┈┈⬡\n\n' +
            "> Utilice `.onlyadmin off` para desactivar"
        )
    }

    if (!args || args === 'status') {
        return m.reply(
            `🔒 *ᴏɴʟʏᴀᴅᴍɪɴ*\n\n` +
            `> Status: ${current ? "✅ Activo" : "❌ Inactivo"}\n\n` +
            `*Uso:*
` +
            `> \`.onlyadmin on\` — Activar
` +
            `> \`.onlyadmin off\` — Desactiva

` +
            `_Solo los administradores del grupo, los propietarios y los chats privados pueden acceder a los botes_`
        )
    }

    if (args === 'on') {
        if (current) return m.reply("⚠️ Sólo Admin está activo.")
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *SOLO ADMINISTRADORES ACTIVADO*\n\n' +
            "╭┈┈⬡「 🔒 *ACCESO* 」\n" +
            "┃ ✅ Admin del grupo\n" +
            '┃ ✅ Owner bot\n' +
            "┃ ✅ Chat privado (todos)\n" +
            "┃ ❌ Miembros habituales en el grupo\n" +
            '╰┈┈⬡'
        )
    }

    if (args === 'off') {
        if (!current) return m.reply("⚠️ Sólo Admin está deshabilitado.")
        db.setting('onlyAdmin', false)
        await m.react('❌')
        return m.reply("❌ *onlyadmin inactivo*\n\n> Bot es accesible para todos")
    }

    return m.reply("❌ Discusión inválida. `on` o `off`")
}

export { pluginConfig as config, handler }
