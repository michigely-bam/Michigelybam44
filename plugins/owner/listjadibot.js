import { getAllJadibotSessions, getActiveJadibots } from '../../src/lib/ourin-jadibot-manager.js'
const pluginConfig = {
    name: 'listjadibot',
    alias: ['jadibotlist', 'alljadibot'],
    category: 'owner',
    description: "Mira todas las sesiones depositarias.",
    usage: '.listjadibot',
    example: '.listjadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sessions = getAllJadibotSessions()
    const active = getActiveJadibots()

    if (sessions.length === 0) {
        return m.reply(`❌ No hay sesión por lo que la bota se salva`)
    }

    let txt = `🤖 *ᴅᴀꜰᴛᴀʀ ᴊᴀᴅɪʙᴏᴛ*\n\n`
    txt += `> 📊 Total: *${sessions.length}* session\n`
    txt += `> 🟢 Aktif: *${active.length}*\n`
    txt += `> ⚫ Offline: *${sessions.length - active.length}*\n\n`

    sessions.forEach((s, i) => {
        const status = s.isActive ? '🟢' : '⚫'
        const label = s.isActive ? 'Online' : 'Offline'
        txt += `${status} *${i + 1}.* @${s.id} — _${label}_\n`
    })

    txt += `\n> \`${m.prefix}listjadibotaktif\` - Detalles activos.
`
    txt += `> \`${m.prefix}stopalljadibot\` - Basta.
`
    txt += `> \`${m.prefix}stopdandeletejadibot @user\` - Retirar el período de sesiones`

    const mentions = sessions.map(s => s.jid)

    await sock.sendMessage(m.chat, {
        text: txt,
        mentions,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: "🟢 Vista activa",
                    id: `${m.prefix}listjadibotaktif`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: "🛑 Parad todos",
                    id: `${m.prefix}stopalljadibot`
                })
            }
        ]
    }, { quoted: m })
}

export { pluginConfig as config, handler }