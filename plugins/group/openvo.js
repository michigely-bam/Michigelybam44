import { downloadContentFromMessage } from 'ourin'
const pluginConfig = {
    name: 'rvo',
    alias: [],
    category: 'group',
    description: "Mensaje abierto 1x ver la respuesta",
    usage: ".rvo (reply message 1x see)",
    example: '.rvo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const quoted = m.quoted

    if (!quoted) {
        await m.reply(
            `❌ *ERROR*\n\n` +
            `¡Responda el mensaje 1x y mira con este comando!
` +
            `> Usa: \`${m.prefix}openvo\` (respondiendo el mensaje 1x ver)`
        )
        return
    }

    const quotedMsg = quoted.message
    if (!quotedMsg) {
        await m.reply(
            `❌ *el mensaje no se encuentra*

` +
            `> No se pudo leer el mensaje respondido.`
        )
        return
    }

    const type = Object.keys(quotedMsg)[0]
    const content = quotedMsg[type]

    if (!content) {
        await m.reply(
            `❌ *CONTENIDO NO ENCONTRADO*\n\n` +
            `El contenido del mensaje no se puede leer.`
        )
        return
    }

    if (!content.viewOnce) {
        await m.reply(
            `❌ *NO ES DE UNA SOLA VISTA*\n\n` +
            `¡Los mensajes a los que se les responde no son mensajes de 1x!
` +
            `> Responder al mensaje con el icono 1x ver (👁️).`
        )
        return
    }

    await m.react('🕕')

    try {
        let mediaType = null
        if (type.includes('image')) {
            mediaType = 'image'
        } else if (type.includes('video')) {
            mediaType = 'video'
        } else if (type.includes('audio')) {
            mediaType = 'audio'
        }

        if (!mediaType) {
            await m.reply(
                `Tipo sin soporte, solo admite imágenes, vídeos, audio`
            )
            return
        }

        const stream = await downloadContentFromMessage(content, mediaType)
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length < 100) {
            await m.reply(
                `❌ *ERROR DE DESCARGA*\n\n` +
                `> No se pudieron descargar los archivos multimedia.
` +
                `Los medios de comunicación pueden haber expirado.`
            )
            return
        }
        const quoted = m.quoted ? m.quoted : m

        if (mediaType === 'image') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'image'
            })
        } else if (mediaType === 'video') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'video'
            })
        } else if (mediaType === 'audio') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'audio',
                mimetype: 'audio/mpeg',
                ptt: true
            })
        }

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Fallo de abrir el mensaje 1x ver.
` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
