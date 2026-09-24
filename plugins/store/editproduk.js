import { getDatabase } from '../../src/lib/ourin-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'editproduk',
    alias: ['editproduct'],
    category: 'store',
    description: "✏️ Editar los productos de la tienda (sólo chat privado)",
    usage: '.editproduk <número> <campo> <valor>',
    example: '.editproduk 1 harga 30000',
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
            `Para mantener la privacidad 🛡️, la edición de productos solo se puede hacer en el chat privado **.

` +
            `Por favor chatear bot en vivo 📱`
        )
    }

    const db = getDatabase()
    const products = db.setting('storeProducts') || []

    if (products.length === 0) {
        return m.reply(`📭 *Aún no hay producto.*

Añadir el producto primero: \`${m.prefix}addproduk\` ➕`)
    }

    const text = m.text?.trim() || ''
    const match = text.match(/^(\d+)\s+(nama|harga|diskon|stok|deskripsi|detail|gambar|video|tipe)\s*(.*)/i)

    if (!match) {
        return m.reply(
            `✏️ *EDIT PRODUCTO*

` +
            `📋 Formato: \`${m.prefix}editproduk <número> <campo> <valor>\`\n\n` +
            `📌 *Field que se puede editar:*
` +
            `• *nama* 🏷️ — Nombre del producto
` +
            `• *harga* 💰 — Precio de venta (número)
` +
            `• *diskon* 🏷️ — Precio original tachado (número, 0 para eliminar)
` +
            `• *stok* 📊 — La cantidad de existencias o \`unlimited\` (ilimitadas)
` +
            `• *tipe* 🔑📦 — \`digital\` o \`fisik\`
` +
            `• *deskripsi* 📝 — Descripción del producto
` +
            `• *detail* 🔒 — Información secreta (enviada después de la compra)
` +
            `• *gambar* 🖼️ — Subir nuevas imágenes (Responde imagen)
` +
            `• *video* 🎬 — Subir un video nuevo (responde a un video)

` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}editproduk 1 harga 30000\`\n` +
            `\`${m.prefix}editproduk 1 diskon 40000\`\n` +
            `\`${m.prefix}editproduk 1 tipe fisik\`\n` +
            `\`${m.prefix}editproduk 1 nama Netflix Premium\`\n` +
            `\`${m.prefix}editproduk 1 deskripsi Cuenta compartida durante 1 mes\`
` +
            `\`${m.prefix}editproduk 1 imagen \` (Responde imagen 🖼️)

` +
            `🏷️ _El precio de descuento se mostrará como ~~el precio original~~ en el catálogo_`
        )
    }

    const idx = parseInt(match[1]) - 1
    const field = match[2].toLowerCase()
    let value = match[3]?.trim() || ''

    if (idx < 0 || idx >= products.length) {
        return m.reply(`❌ *Número de producto no válido.*

Rango: 1-${products.length} 📋`)
    }

    const product = products[idx]

    switch (field) {
        case 'nama': {
            if (!value || value.length < 2) return m.reply(`❌ *Los nombres son demasiado cortos.* Un mínimo de 2 caracteres 🏷️`)
            product.name = value
            break
        }
        case 'harga': {
            const price = parseInt(value)
            if (isNaN(price) || price < 1000) return m.reply(`❌ *El precio no es válido.* Mínimo de Rp 1.000 💰`)
            product.price = price
            break
        }
        case 'diskon': {
            const origPrice = parseInt(value)
            if (isNaN(origPrice) || origPrice === 0) {
                product.originalPrice = null
            } else {
                if (origPrice <= product.price) return m.reply(`❌ *El precio de descuento debe ser mayor que el precio de venta.*

Precio de venta actual: Rp ${product.price.toLocaleString('id-ID')} 💰`)
                product.originalPrice = origPrice
            }
            break
        }
        case 'stok': {
            product.stock = value.toLowerCase() === 'unlimited' ? -1 : parseInt(value)
            if (isNaN(product.stock)) return m.reply(`❌ *Las existencias no son válidas.* Usa un número o \`unlimited\` 📊`)
            break
        }
        case 'tipe': {
            const newType = value.toLowerCase()
            if (newType !== 'digital' && newType !== 'fisik') {
                return m.reply(`❌ *Tipo no es válido.* Utilice \`digital\` 🔑 o \`fisik\` 📦`)
            }
            if (newType === 'fisik' && product.type === 'digital' && product.stockItems?.length > 0) {
                return m.reply(
                    `⚠️ *No se puede cambiar a Física*

` +
                    `Este producto tiene *${product.stockItems.length}*datos de cuentas 🔑
` +
                    `Elimine todos los artículos de stock antes de cambiar el tipo a físico.

` +
                    `🗑️ Eliminar todo: \`${m.prefix}editproduk ${idx + 1} stok 0\``
                )
            }
            product.type = newType
            if (newType === 'fisik' && !product.stock) product.stock = 0
            break
        }
        case 'deskripsi': {
            product.description = value.replace(/;;/g, '\n')
            break
        }
        case 'detail': {
            product.detail = value.replace(/;;/g, '\n')
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
                    if (url) product.image = url
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
                    if (url) product.video = url
                    else return m.reply(`❌ *Fallo en subir el video.* Trate de hacerlo más tarde 🎬`)
                }
            } catch {
                return m.reply(`❌ *Fallo en subir el video.* Trate de hacerlo más tarde 🎬`)
            }
            break
        }
        default:
            return m.reply(`❌ *El campo es desconocido.*

Utiliza estos campos: nama, harga, diskon, stok, tipe, deskripsi, detail, gambar, video 📋`)
    }

    db.setting('storeProducts', products)
    await m.react('✅')

    const typeIcon = product.type === 'fisik' ? '📦' : '🔑'
    const typeLabel = product.type === 'fisik' ? "Físico" : 'Digital'

    let reply = `✅ *PRODUCTO ACTUALIZADO*

`
    reply += `🏷️ Nombre: *${product.name}*\n`
    reply += `💰 Precio: *Rp ${product.price.toLocaleString('id-ID')}*`
    if (product.originalPrice) reply += ` ~~Rp ${product.originalPrice.toLocaleString('id-ID')}~~`
    reply += `\n`
    reply += `${typeIcon} Tipo: *${typeLabel}*\n`
    reply += `📊 Existencias: *${product.stock === -1 ? '♾️ Ilimitadas' : product.stock}*\n`
    if (field === 'gambar') reply += `🖼️ Imagen: ✅
`
    if (field === 'video') reply += `🎬 Video: ✅\n`
    reply += `
👀 _Ver cambios: \`${m.prefix}listproduk\`_`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
