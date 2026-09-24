const pluginConfig = {
    name: 'toimg',
    alias: ['toimage', 'stickertoimage', 'stimg'],
    category: 'tools',
    description: "Convirtiendo las stickers en imágenes",
    usage: '.toimg (reply/caption sticker)',
    example: '.toimg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let mediaSource = null
    let downloadFn = null
    const selfIsSticker = m.isSticker || 
                          m.type === 'stickerMessage' || 
                          m.message?.stickerMessage
    const quotedIsSticker = m.quoted && (
        m.quoted.isSticker || 
        m.quoted.type === 'stickerMessage' || 
        m.quoted.mtype === 'stickerMessage' ||
        m.quoted.message?.stickerMessage
    )
    
    if (selfIsSticker) {
        mediaSource = 'self'
        downloadFn = m.download
    } else if (quotedIsSticker) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
    }
    
    if (!mediaSource) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `> ¡No se detectó ningún sticker!

` +
            `*Modo de uso:*
` +
            `> 1. Envía un sticker + una captura \`${m.prefix}toimg\`\n` +
            `> 2. Responda el sticker con \`${m.prefix}toimg\``
        )
        return
    }

    const stickerMsg = mediaSource === 'self' 
        ? m.message?.stickerMessage 
        : m.quoted?.message?.stickerMessage
    const isAnimated = stickerMsg?.isAnimated

    if (isAnimated) {
        await m.reply(
            `⚠️ *STICKER ANIMADO*

` +
            `> Este sticker es animado (GIF).
` +
            `> Usa \`${m.prefix}tovideo\` para cambiarlo.`
        )
        return
    }

    await m.react('🕕')

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.reply(
                `❌ *ERROR*\n\n` +
                `> No se pudo descargar el sticker.
` +
                `> Es posible que el sticker ya no esté disponible.`
            )
            return
        }

        if (buffer.length < 100) {
            await m.reply(
                `❌ *ARCHIVO DAÑADO*\n\n` +
                `Los ficheros de archivo no son válidos o están dañados.
` +
                `> Intenta enviar el sticker de nuevo.`
            )
            return
        }

        await sock.sendMedia(m.chat, buffer, null, m, {
            type: 'image'
        })

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `Ha ocurrido un error en el procesamiento.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
