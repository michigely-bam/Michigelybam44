const pluginConfig = {
    name: ['hapussaluran', 'deletesaluran', 'deletenewsletter'],
    alias: [],
    category: 'owner',
    description: "Eliminar el canal / nuevo",
    usage: '.hapussaluran <id_canal>',
    example: '.hapussaluran 120363xxx@newsletter',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    let targetJid = text

    if (!targetJid) {
        return m.reply(
            "🗑️ *borrar el canal*\n\n" +
            "> `.hapussaluran <id_canal>` — Eliminar el canal\n\n" +
            '📝 Ejemplo:\n' +
            '> `.hapussaluran 120363xxx@newsletter`\n\n' +
            "⚠️ Los canales se eliminarán permanentemente"
        )
    }

    if (!targetJid.endsWith('@newsletter')) {
        targetJid += '@newsletter'
    }

    try {
        await sock.newsletterDelete(targetJid)
        await m.react('✅')
        return m.reply(`🗑️ *Canal eliminado*

> ID: ${targetJid}`)
    } catch (err) {
        return m.reply(`❌ No se pudo delete channel: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
