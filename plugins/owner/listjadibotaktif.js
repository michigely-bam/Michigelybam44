import { getActiveJadibots } from '../../src/lib/ourin-jadibot-manager.js'
const pluginConfig = {
    name: 'listjadibotaktif',
    alias: ['jadibotaktif', 'activejadibots'],
    category: 'owner',
    description: "Mira el kebabot que está siendo activado con detalle",
    usage: '.listjadibotaktif',
    example: '.listjadibotaktif',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

async function handler(m, { sock }) {
    const active = getActiveJadibots()

    if (active.length === 0) {
        return m.reply(`❌ No hay jabots activos en este momento`)
    }

    let txt = `🟢 *ᴊᴀᴅɪʙᴏᴛ ᴀᴋᴛɪꜰ*\n\n`
    txt += `> 📊 Total: *${active.length}* activo bot

`

    active.forEach((s, i) => {
        const uptime = formatUptime(Date.now() - s.startedAt)
        const owner = s.ownerJid?.split('@')[0] || 'Unknown'
        txt += `*${i + 1}.* 🟢 @${s.id}\n`
        txt += `   ⏱️ *${uptime}* — 👤 @${owner}\n\n`
    })

    txt += `> \`${m.prefix}stopalljadibot\` - Basta.`

    const mentions = active.flatMap(s => [s.jid, s.ownerJid].filter(Boolean))

    await sock.sendMessage(m.chat, {
        text: txt,
        mentions,
        interactiveButtons: [
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