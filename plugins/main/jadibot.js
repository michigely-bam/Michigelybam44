import { startJadibot, isJadibotActive } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'jadibot',
    alias: ['jadibotqr', 'becomebot', 'bot'],
    category: 'main',
    description: "Haga su número un bot (Código de pago / QR)",
    usage: '.jadibot atau .jadibot qr',
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
            `⚠️ *ᴊᴀᴅɪʙᴏᴛ ꜱᴜᴅᴀʜ ᴀᴋᴛɪꜰ*\n\n` +
            `> Nomor kamu sudah menjadi bot\n` +
            `> Ketik \`${m.prefix}stopjadibot\` untuk menghentikan`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴍᴏᴅᴇ*\n\n` +
            `> Menyiapkan koneksi...\n` +
            `> Scan QR Code yang akan dikirim`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
            `> Menyiapkan koneksi...`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ*\n\n` +
            `> ${e.message || 'Terjadi kesalahan'}\n\n` +
            `Coba lagi dalam beberapa menit.`
        )
    }
}

export { pluginConfig as config, handler }
