import { startJadibot, isJadibotActive } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'jadibot',
    alias: ['jadibotqr', 'becomebot', 'bot'],
    category: 'main',
    description: "Haga su número un bot (Código de pago / QR)",
    usage: ".jadibot o .jadibot qr",
    example: '.jadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply("❌ Fallado para identificar su número")

    if (isJadibotActive(sender)) {
        return m.reply(
            `⚠️ *JADIBOT YA ESTÁ ACTIVO*\n\n` +
            `Tu número ya es un bot.
` +
            `> Escribe \`${m.prefix}stopjadibot\` para detener`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴍᴏᴅᴇ*\n\n` +
            `> Preparando la conexión...
` +
            `> Scan QR El código que se enviará`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
            `> Preparando la conexión...`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ERROR*\n\n` +
            `> ${e.message || "Ocurrió un error"}\n\n` +
            `Inténtalo de nuevo en unos minutos.`
        )
    }
}

export { pluginConfig as config, handler }
