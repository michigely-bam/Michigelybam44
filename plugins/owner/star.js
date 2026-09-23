const pluginConfig = {
    name: ['star', 'bintang'],
    alias: [],
    category: 'owner',
    description: "Agregar / Eliminar estrellas a mensajes",
    usage: ".estrella (mensaje de respuesta) o .star eliminar (reprobar mensajes)",
    example: '.star',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            '⭐ *sᴛᴀʀ ᴍᴇssᴀɢᴇ*\n\n' +
            '> `.star` (reply pesan) — Beri bintang\n' +
            '> `.star hapus` (reply pesan) — Hapus bintang'
        )
    }

    const unstar = m.args[0]?.toLowerCase() === 'hapus' || m.args[0]?.toLowerCase() === 'unstar'
    const key = m.quoted.key

    try {
        await sock.chatModify({
            star: {
                messages: [{ id: key.id, fromMe: key.fromMe }],
                star: !unstar
            }
        }, m.chat)

        await m.react('⭐')
        return m.reply(
            unstar
                ? "❌ *Estrellas eliminadas de mensajes*"
                : "⭐ *Mensaje marcado por estrella*"
        )
    } catch (err) {
        return m.reply(`❌ Gagal: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
