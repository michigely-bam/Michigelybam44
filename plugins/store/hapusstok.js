import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'hapusstok',
    alias: ['delstok', 'delstock', 'deletestok'],
    category: 'store',
    description: "🗑️ Eliminar los artículos de stock del producto",
    usage: '.hapusstok <número_producto> <número_artículo>',
    example: '.hapusstok 1 3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const products = db.setting('storeProducts') || []

    if (products.length === 0) {
        return m.reply(`📭 *Aún no hay producto.*

Añadir el producto primero: \`${m.prefix}addproduk\` ➕`)
    }

    const args = m.text?.trim().split(/\s+/) || []
    const productNo = parseInt(args[0]) - 1
    const itemNo = parseInt(args[1]) - 1

    if (args.length < 2 || isNaN(productNo) || isNaN(itemNo)) {
        return m.reply(
            `🗑️ *ELIMINAR EXISTENCIAS*

` +
            `Formato: \`${m.prefix}hapusstok <número_producto> <número_artículo>\`\n\n` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}hapusstok 1 3\` — Eliminar el artículo 3 del producto 1

` +
            `📋 Consulta el número del artículo: \`${m.prefix}liststok <número_producto>\``
        )
    }

    if (productNo < 0 || productNo >= products.length) {
        return m.reply(`❌ *Número de producto no válido.*

Rango: 1-${products.length} 📋`)
    }

    const product = products[productNo]

    if (product.type === 'fisik') {
        const reduceCount = parseInt(args[1])
        if (isNaN(reduceCount) || reduceCount <= 0) {
            return m.reply(
                `📦 *Productos físicos*

` +
                `Para reducir las existencias físicas, utiliza:
` +
                `\`${m.prefix}editproduk ${productNo + 1} stok <cantidad_nueva>

` +
                `Existencias actuales: *${product.stock === -1 ? '♾️ Ilimitadas' : product.stock + ' unidades'}*`
            )
        }
        if (product.stock !== -1) {
            product.stock = Math.max(0, product.stock - reduceCount)
            db.setting('storeProducts', products)
            await m.react('✅')
            return m.reply(
                `📦 *EXISTENCIAS FÍSICAS REDUCIDAS*

` +
                `🏷️ Producto: *${product.name}*\n` +
                `➖ Reducción: *${reduceCount} unidades*\n` +
                `📊 Existencias restantes: *${product.stock} unidades*`
            )
        }
        return m.reply(`♾️ *No se puede reducir el stock ilimitado.*

Cambia primero las existencias: \`${m.prefix}editproduk ${productNo + 1} stok <cantidad>`)
    }

    const stockItems = product.stockItems || []

    if (itemNo < 0 || itemNo >= stockItems.length) {
        return m.reply(`❌ *Número de artículo inválido.*

Rango: 1-${stockItems.length}

📋 Ver lista: \`${m.prefix}liststok ${productNo + 1}\``)
    }

    const deleted = stockItems.splice(itemNo, 1)[0]
    product.stock = stockItems.length
    db.setting('storeProducts', products)

    await m.react('✅')
    return m.reply(
        `🗑️ *EXISTENCIAS FUE ELIMINADO*

` +
        `🏷️ Producto: *${product.name}*\n` +
        `🔑 Item: \`${deleted.detail.replace(/\n/g, ' ').substring(0, 50)}\`\n` +
        `📊 Existencias restantes: *${stockItems.length}* cuenta`
    )
}

export { pluginConfig as config, handler }
