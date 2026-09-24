import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'editstok',
    alias: ['editstock'],
    category: 'store',
    description: "✏️ Editar productos de artículo de stock (sólo en chat privado)",
    usage: ".editstok <número_producto> <número_artículo>|<detalle_nuevo>",
    example: ".Editor 1 3@mail.com;;Password: newpass",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.isGroup) {
        return m.reply(
            `🚫 *Debido de acceso*

` +
            `Para mantener la privacidad 🛡️, la edición de existencias sólo se puede hacer en el chat privado **.

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
    const firstPipe = text.indexOf('|')

    if (firstPipe === -1) {
        return m.reply(
            `✏️ *EDITAR EXISTENCIAS*

` +
            `📋 Formato: \`${m.prefix}editstok <número_producto> <número_artículo>|<detalle_nuevo>\`\n\n` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}editstok 1 3|Correo: nuevo@mail.com;;Contraseña: nueva_clave\`\n\n` +
            `• Usa \`;;\` para crear líneas nuevas en el detalle 🔑
` +
            `📋 Consulta el número del artículo: \`${m.prefix}liststok <número_producto>\`\n\n` +
            `⚠️ _Las acciones ya enviadas a los compradores no cambiarán_ 🔒`
        )
    }

    const before = text.substring(0, firstPipe).trim()
    const newDetail = text.substring(firstPipe + 1).trim().replace(/;;/g, '\n')

    const parts = before.split(/\s+/)
    const productNo = parseInt(parts[0]) - 1
    const itemNo = parseInt(parts[1]) - 1

    if (isNaN(productNo) || productNo < 0 || productNo >= products.length) {
        return m.reply(`❌ *Número de producto no válido.*

Rango: 1-${products.length} 📋`)
    }

    const product = products[productNo]

    if (product.type === 'fisik') {
        return m.reply(
            `📦 *Productos físicos*

` +
            `Los productos físicos no tienen datos por artículo 🔑
` +
            `Para cambiar las existencias, utiliza:
` +
            `\`${m.prefix}editproduk ${productNo + 1} stok <cantidad>`
        )
    }

    const stockItems = product.stockItems || []

    if (isNaN(itemNo) || itemNo < 0 || itemNo >= stockItems.length) {
        return m.reply(`❌ *Número de artículo inválido.*

Rango: 1-${stockItems.length}

📋 Ver lista: \`${m.prefix}liststok ${productNo + 1}\``)
    }

    if (!newDetail || newDetail.length < 3) {
        return m.reply(`❌ *El detalle es demasiado corto.*

Se requieren al menos 3 caracteres 🔑`)
    }

    const oldDetail = stockItems[itemNo].detail
    stockItems[itemNo].detail = newDetail
    stockItems[itemNo].updatedAt = new Date().toISOString()

    db.setting('storeProducts', products)
    await m.react('✅')

    return m.reply(
        `✅ *EXISTENCIAS RENOVADO*

` +
        `🏷️ Producto: *${product.name}*\n` +
        `🔑 Item #${itemNo + 1}\n\n` +
        `❌ Antes de:
\`${oldDetail.replace(/\n/g, ' ').substring(0, 50)}\`\n\n` +
        `✅ Después:
\`${newDetail.replace(/\n/g, ' ').substring(0, 50)}\`\n\n` +
        `⚠️ _Los cambios solo se aplican a los artículos que no han sido enviados a los compradores_ 🔒`
    )
}

export { pluginConfig as config, handler }
