import { getDatabase } from '../../src/lib/ourin-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'editlist',
    alias: ['editinfo'],
    category: 'store',
    description: "✏️ Editar información de la tienda (sólo chat privado)",
    usage: '.editlist <número> <campo> <valor>',
    example: '.editlist 1 isi Nuevo contenido aquí',
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
            `Para mantener la seguridad de los datos 🛡️, la edición de la información sólo se puede hacer en el chat privado **.

` +
            `Por favor chatear bot en vivo 📱`
        )
    }

    const db = getDatabase()
    const lists = db.setting('storeLists') || []

    if (lists.length === 0) {
        return m.reply(`📭 *Aún no hay información.*

Añade información primero: \`${m.prefix}addlist\` ➕`)
    }

    const text = m.text?.trim() || ''
    const match = text.match(/^(\d+)\s+(nama|isi|deskripsi|gambar|video)\s*(.*)/i)

    if (!match) {
        return m.reply(
            `✏️ *EDIT INFORMACIÓN DE LA TIENDA*

` +
            `📋 Formato: \`${m.prefix}editlist <número> <campo> <valor>\`\n\n` +
            `📌 *Field que se puede editar:*
` +
            `• *nama* 🏷️ — Título de información
` +
            `• *isi* 📝 — Contenido de información (usar \`;;\` para nuevas líneas)
` +
            `• *deskripsi* 📋 — Breve descripción (previsión en la lista)
` +
            `• *gambar* 🖼️ — Subir nuevas imágenes (Responde imagen)
` +
            `• *video* 🎬 — Subir un video nuevo (responde a un video)

` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}editlist 1 isi Nuevo requisito: blablabla;;Condiciones: blablabla\`
` +
            `\`${m.prefix}editlist 1 nama Preguntas frecuentes sobre pagos\`
` +
            `\`${m.prefix}editlist 1 imagen \` (Responde imagen 🖼️)

` +
            `_Use \`;;\` para nuevas líneas en el contenido_ ✍️`
        )
    }

    const idx = parseInt(match[1]) - 1
    const field = match[2].toLowerCase()
    let value = match[3]?.trim() || ''

    if (idx < 0 || idx >= lists.length) {
        return m.reply(`❌ *Número inválido.*

Rango: 1-${lists.length} 📋`)
    }

    const item = lists[idx]

    switch (field) {
        case 'nama': {
            if (!value || value.length < 2) return m.reply(`❌ *Los nombres son demasiado cortos.* Un mínimo de 2 caracteres 🏷️`)
            item.name = value
            break
        }
        case 'isi': {
            if (!value || value.length < 3) return m.reply(`❌ *El contenido es demasiado corto.* Un mínimo de 3 caracteres 📝`)
            item.content = value.replace(/;;/g, '\n')
            item.description = item.content.substring(0, 80).replace(/\n/g, ' ')
            break
        }
        case 'deskripsi': {
            item.description = value.replace(/;;/g, ' ')
            break
        }
        case 'gambar': {
            const hasMedia = m.quoted?.isMedia && (m.quoted?.isImage || m.quoted?.type === 'imageMessage')
            const isDirectImage = m.isImage
            if (!hasMedia && !isDirectImage) return m.reply(`🖼️ *Responde o envíe una nueva imagen.*

Envía una imagen y responde con este comando.`)
            await m.reply(`⏳ _Subiendo la imagen..._`)
            try {
                const buffer = hasMedia ? await m.quoted.download() : await m.download()
                if (buffer) {
                    const url = await uploadToCatbox(buffer, 'image.jpg')
                    if (url) item.image = url
                    else return m.reply(`❌ *Fallo en subir las imágenes.* Prueba más tarde 🖼️`)
                }
            } catch {
                return m.reply(`❌ *Fallo en subir las imágenes.* Prueba más tarde 🖼️`)
            }
            break
        }
        case 'video': {
            const hasMedia = m.quoted?.isMedia && (m.quoted?.isVideo || m.quoted?.type === 'videoMessage')
            const isDirectVideo = m.isVideo
            if (!hasMedia && !isDirectVideo) return m.reply(`🎬 *Responde o envíe un nuevo video.*

Envíe el video y responda con este comando.`)
            await m.reply(`⏳ _Subiendo el video..._`)
            try {
                const buffer = hasMedia ? await m.quoted.download() : await m.download()
                if (buffer) {
                    const url = await uploadToCatbox(buffer, 'video.mp4')
                    if (url) item.video = url
                    else return m.reply(`❌ *Fallo en subir el video.* Trate de hacerlo más tarde 🎬`)
                }
            } catch {
                return m.reply(`❌ *Fallo en subir el video.* Trate de hacerlo más tarde 🎬`)
            }
            break
        }
        default:
            return m.reply(`❌ *El campo es desconocido.*

Utilice: nombre, contenido, descripción, imagen, video 📋`)
    }

    db.setting('storeLists', lists)
    await m.react('✅')

    let reply = `✅ *INFORMACIÓN ACTUALIZADA*

`
    reply += `🏷️ Nombre: *${item.name}*\n`
    if (field === 'isi') reply += `📝 Contenido:
${item.content}\n\n`
    if (field === 'gambar') reply += `🖼️ Imagen: ✅
`
    if (field === 'video') reply += `🎬 Video: ✅\n`
    reply += `
👀 _Ver cambios: \`${m.prefix}list\`_`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
