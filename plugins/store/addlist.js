import { getDatabase } from '../../src/lib/ourin-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'addlist',
    alias: ['addinfo'],
    category: 'store',
    description: "➕ Añada nueva información de la tienda (sólo chat privado)",
    usage: '.addlist <nombre>|<contenido>',
    example: '.addlist Condiciones|1. Las compras no se pueden cancelar;;2. Garantía de 7 días',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function uploadToCatbox(buffer, filename = 'file.jpg') {
    try {
        const form = new FormData()
        form.append('fileToUpload', buffer, { filename })
        form.append('reqtype', 'fileupload')
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 30000
        })
        return res.data?.startsWith('http') ? res.data : null
    } catch {
        return null
    }
}

async function handler(m, { sock }) {
    if (m.isGroup) {
        return m.reply(
            `🚫 *Debido de acceso*

` +
            `Para mantener la seguridad de los datos 🛡️, la adición de información solo puede hacerse en el chat privado **.

` +
            `Por favor ingrese el bot de chat en directo 📱, y escriba:
` +
            `\`${m.prefix}addlist <nombre>|<contenido>\``
        )
    }

    const db = getDatabase()
    const text = m.text?.trim() || ''
    const pipeIdx = text.indexOf('|')

    if (pipeIdx === -1) {
        return m.reply(
            `➕ *ADICIÓN DE INFORMACIÓN DE LA TIENDA*

` +
            `📋 Formato:\n` +
            `\`${m.prefix}addlist <nombre>|<contenido>\`\n\n` +
            `📌 *Parámetros:*\n` +
            `• *nama* — Título de información (min. 2 caracteres)
` +
            `• *isi* — Contenido de información (usar \`;;\` para nuevas líneas)

` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}addlist Términos y condiciones|1. La compra no puede ser cancelada; 2. 7 días de garantía; 3. Ponte en contacto con el administrador para las reclamaciones
` +
            `\`${m.prefix}addlist Cómo comprar|1. Escribe .listproduk;;2. Elige un producto;;3. Escribe .beli <número>\`

` +
            `🖼️ *Consejos:*\n` +
            `• Enviar una imagen/video primero, y luego responder a los medios con el comando arriba para agregar los medios 📸
` +
            `• Utilice \`;;\` para crear nuevas líneas en el contenido de información ✍️
` +
            `• Esta información se puede ver a todos a través de \`${m.prefix}list\` 👥`
        )
    }

    const name = text.substring(0, pipeIdx).trim()
    const content = text.substring(pipeIdx + 1).trim().replace(/;;/g, '\n')

    if (!name || name.length < 2) {
        return m.reply(`❌ *El nombre es demasiado corto.*

Se requieren al menos 2 caracteres para ser fácilmente reconocibles 📝`)
    }
    if (!content || content.length < 3) {
        return m.reply(`❌ *El contenido de la información es demasiado corto.*

Se requiere un mínimo de 3 caracteres ✍️`)
    }

    let imageUrl = null
    let videoUrl = null

    const hasQuotedMedia = m.quoted?.isMedia
    const isDirectMedia = m.isMedia && (m.isImage || m.isVideo)

    if (hasQuotedMedia || isDirectMedia) {
        await m.reply(`⏳ _Subiendo archivos..._`)
        try {
            const buffer = hasQuotedMedia ? await m.quoted.download() : await m.download()
            if (buffer) {
                const isImage = m.quoted?.isImage || m.quoted?.type === 'imageMessage' || m.isImage
                const isVideo = m.quoted?.isVideo || m.quoted?.type === 'videoMessage' || m.isVideo
                const url = await uploadToCatbox(buffer, isVideo ? 'video.mp4' : 'image.jpg')
                if (url) {
                    if (isVideo) videoUrl = url
                    else imageUrl = url
                }
            }
        } catch (e) {
            console.error('[AddList] Upload error:', e.message)
        }
    }

    const lists = db.setting('storeLists') || []
    const newList = {
        id: `L${Date.now()}`,
        name,
        content,
        description: content.substring(0, 80).replace(/\n/g, ' '),
        image: imageUrl,
        video: videoUrl,
        createdAt: new Date().toISOString()
    }

    lists.push(newList)
    db.setting('storeLists', lists)

    await m.react('✅')

    let reply = `✅ *INFORMACIÓN AÑADIDA*

`
    reply += `🏷️ Nombre: *${name}*\n`
    if (imageUrl) reply += `🖼️ Medios de comunicación: ✅ imágenes
`
    if (videoUrl) reply += `🎬 Media: ✅ Video\n`
    reply += `📝 Contenido:
${content}\n\n`
    reply += `📋 _Ver lista: \`${m.prefix}list\`_\n`
    reply += `✏️ _Edit: \`${m.prefix}editlist ${lists.length}\`_`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
