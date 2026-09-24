const pluginConfig = {
    name: ['hapusgrup', 'deletegrup', 'delgrup'],
    alias: [],
    category: 'owner',
    description: "Quit group / remove group",
    usage: ".hapusgrup [jid_grupo]",
    example: '.hapusgrup',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.args[0]) {
        targetJid = m.args[0].replace(/[^0-9@.]/g, '')
        if (!targetJid.endsWith('@g.us')) targetJid += '@g.us'
    } else if (m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid || !targetJid.endsWith('@g.us')) {
        return m.reply(
            "🗑️ *borrar el grupo*\n\n" +
            "> `.hapusgrup` (en grupo) — Salir de este grupo\n" +
            "> `.hapusgrup <id_grup>` — Saliendo de un grupo determinado\n\n" +
            "⚠️ El bot saldrá del grupo, no eliminará el grupo permanentemente"
        )
    }

    try {
        const metadata = await sock.groupMetadata(targetJid).catch(() => null)
        const groupName = metadata?.subject || targetJid

        await sock.groupLeave(targetJid)
        await m.react('✅')
        return m.reply(
            `🗑️ *EL BOT SALIÓ DEL GRUPO*\n\n` +
            `> Grupo: ${groupName}\n` +
            `> ID: ${targetJid}`
        )
    } catch (err) {
        return m.reply(`❌ Fallado para dejar el grupo: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
