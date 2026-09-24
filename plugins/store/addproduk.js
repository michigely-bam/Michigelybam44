import { getDatabase } from '../../src/lib/ourin-database.js'
import axios from 'axios'
import FormData from 'form-data'

const pluginConfig = {
    name: 'addproduk',
    alias: ['addproduct'],
    category: 'store',
    description: "➕ Añadir un nuevo producto a la tienda (sólo chat privado)",
    usage: '.addproduk <nombre>|<precio>|<tipo>|<existencias>|<descripción>',
    example: ".addproduk Spotify Premium|25000|digital|10|Cuenta Premium de 1 mes",
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
            `Para mantener la privacidad y seguridad de los datos del producto 🛡️, la adición de productos solo se puede hacer en el chat privado **.

` +
            `Por favor ingrese el bot de chat en directo 📱, y escriba:
` +
            `\`${m.prefix}addproduk <nombre>|<precio>|<tipo>|<existencias>|<descripción>\``
        )
    }

    const db = getDatabase()
    const text = m.text?.trim() || ''
    const parts = text.split('|').map(p => p.trim())

    if (parts.length < 2) {
        return m.reply(
            `➕ *AÑADIÓ NUEVOS PRODUCTOS*

` +
            `📋 Formato:\n` +
            `\`${m.prefix}addproduk <nombre>|<precio>|<tipo>|<existencias>|<descripción>\`\n\n` +
            `📌 *Parámetros:*\n` +
            `• *nama* — Nombre del producto (min. 2 caracteres)
` +
            `• *harga* — Precio en rupias (mín. 1.000)
` +
            `• *tipe* — \`digital\` 🔑 o \`fisik\` 📦 (opcional, por defecto: digital)
` +
            `• *stok* — La cantidad de existencias o \`unlimited\` (ilimitadas; opcional, por defecto: 999)
` +
            `• *deskripsi* — Breve descripción (opcional)

` +
            `🔑 *Digital* = Producto en forma de cuenta/key/data único por artículo
` +
            `📦 *Físico* = Productos en forma de mercancía, existencias en forma de cantidad

` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}addproduk Spotify Premium|25000|digital|10|Cuenta Premium de 1 mes\`
` +
            `\`${m.prefix}addproduk Camiseta|65000|fisik|8|Camiseta lisa de algodón 30s\`
` +
            `\`${m.prefix}addproduk Netflix|35000|digital|unlimited|Cuenta compartida\`\n\n` +
            `🖼️ *Consejos:*\n` +
            `• Envíe la imagen/video primero, y luego responda a los medios con el comando arriba para añadir la thumbnail 📸
` +
            `• Para el producto *digital*, use \`${m.prefix}addstok\` después de que el producto se haya creado para agregar datos de cuenta/key 🔑
` +
            `• Para un producto *fisik* (físico), las existencias se ajustan automáticamente según la cantidad indicada 📦
` +
            `• El precio de descuento puede ajustarse más adelante con \`${m.prefix}editproduk\` 🏷️`
        )
    }

    const name = parts[0]
    const price = parseInt(parts[1])
    const typeStr = (parts[2] || 'digital').toLowerCase()
    const stockStr = parts[3] || ''
    const description = (parts[4] || '').replace(/;;/g, '\n')

    if (!name || name.length < 2) {
        return m.reply(`❌ *El producto de nombre es demasiado corto.*

Se requiere un mínimo de 2 caracteres para que el cliente se identifique fácilmente 📝`)
    }
    if (isNaN(price) || price < 1000) {
        return m.reply(`❌ *El precio es nulo.*

El precio mínimo *Rp 1.000* 💰 Asegúrese de introducir el número correcto.`)
    }

    const type = typeStr === 'fisik' || typeStr === 'physical' ? 'fisik' : 'digital'
    const stock = stockStr.toLowerCase() === 'unlimited' ? -1 : (parseInt(stockStr) || 999)

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
            console.error('[AddProduk] Upload error:', e.message)
        }
    }

    const products = db.setting('storeProducts') || []
    const newProduct = {
        id: `P${Date.now()}`,
        name,
        price,
        originalPrice: null,
        type,
        stock,
        stockItems: [],
        description,
        detail: '',
        image: imageUrl,
        video: videoUrl,
        createdAt: new Date().toISOString()
    }

    products.push(newProduct)
    db.setting('storeProducts', products)

    await m.react('✅')

    const typeIcon = type === 'digital' ? '🔑' : '📦'
    const typeLabel = type === 'digital' ? 'Digital' : "Físico"

    let reply = `✅ *PRODUCTO AÑADIDO*

`
    reply += `🏷️ Nombre: *${name}*\n`
    reply += `💰 Precio: *Rp ${price.toLocaleString('id-ID')}*\n`
    reply += `${typeIcon} Tipo: *${typeLabel}*\n`
    reply += `📊 Existencias: *${stock === -1 ? 'Ilimitadas ♾️' : stock}*\n`
    if (description) reply += `📝 Descripción${description}_\n`
    if (imageUrl) reply += `🖼️ Miniatura: ✅ Imagen
`
    if (videoUrl) reply += `🎬 Thumbnail: ✅ Video\n`
    reply += `
📌 *Siguientes pasos:*
`

    if (type === 'digital') {
        reply += `1️⃣ Añadir datos de cuenta/key: \`${m.prefix}addstok ${products.length}|<detail>\`\n`
        reply += `2️⃣ O importar desde el archivo .txt: \`${m.prefix}addstok ${products.length}\` (reply file 📄)\n`
    } else {
        reply += `1. Existencias configuradas automáticamente (${stock} unidades) 📦\n`
        reply += `2: Añade existencias: \`${m.prefix}editproduk ${products.length} stok <cantidad>
`
    }
    reply += `Tres: Vea el producto: \`${m.prefix}listproduk\` 🛍️\n\n`
    reply += `_El producto será visible por el cliente a través de \`${m.prefix}listproduk\`_ 🎉`

    return m.reply(reply)
}

export { pluginConfig as config, handler }
