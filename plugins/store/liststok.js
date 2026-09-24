import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'liststok',
    alias: ['liststock', 'stok', 'stock'],
    category: 'store',
    description: "📋 Ver la lista de productos de stock",
    usage: '.liststok <número_producto>',
    example: '.liststok 1',
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

    const idx = parseInt(m.text?.trim()) - 1

    if (isNaN(idx) || idx < 0 || idx >= products.length) {
        let txt = `📋 *PRODUCCIÓN DE EXISTENCIAS DE TIERRA*

Seleccione un producto para ver el stock:

`
        for (let i = 0; i < products.length; i++) {
            const p = products[i]
            const typeIcon = p.type === 'fisik' ? '📦' : '🔑'
            const stockDisplay = p.type === 'fisik'
                ? (p.stock === -1 ? '♾️' : `${p.stock} unidades`)
                : `${p.stockItems?.length || 0} cuenta`
            const icon = (p.type === 'fisik' ? (p.stock > 0 || p.stock === -1) : (p.stockItems?.length > 0 || p.stock === -1)) ? '✅' : '⚠️'
            txt += `${typeIcon} *${i + 1}.* ${p.name} — ${stockDisplay} ${icon}\n`
        }
        txt += `
Escribe \`${m.prefix}liststock - Número de contacto\` para ver los detalles del stock 📊`
        return m.reply(txt)
    }

    const product = products[idx]
    const typeIcon = product.type === 'fisik' ? '📦' : '🔑'

    if (product.type === 'fisik') {
        return m.reply(
            `📦 *EXISTENCIAS: ${product.name}*\n\n` +
            `📊 Tipo: *Físico*
` +
            `📦 Total: *${product.stock === -1 ? '♾️ Ilimitadas' : product.stock + ' unidades'}*\n\n` +
            `*Gestión de las existencias:*
` +
            `• Añadir: \`${m.prefix}addstok ${idx + 1} <cantidad>\`
` +
            `• Editar: \`${m.prefix}editproduk ${idx + 1} stok <cantidad>

` +
            `_El stock físico está organizado por cantidad, no por elemento_ 📦`
        )
    }

    const stockItems = product.stockItems || []

    if (stockItems.length === 0) {
        return m.reply(
            `🔑 *Existencias: ${product.name}*\n\n` +
            `📭 No se han añadido artículos a las existencias.

` +
            `*Añadir existencias:*
` +
            `• Manual: \`${m.prefix}addstok ${idx + 1}|<detalle>\`\n` +
            `• Importar: \`${m.prefix}addstok ${idx + 1}\` (responde con un archivo .txt 📄)\n\n` +
            `_Estos artículos son confidenciales 🔒 y solo se envían al comprador después de que se confirme el pago_`
        )
    }

    let txt = `🔑 *EXISTENCIAS: ${product.name}*\n\n`
    txt += `📊 Total: *${stockItems.length}* cuenta

`

    const showItems = stockItems.slice(0, 30)
    for (let i = 0; i < showItems.length; i++) {
        const preview = showItems[i].detail.replace(/\n/g, ' ').substring(0, 40)
        txt += `\`${i + 1}.\` ${preview}${showItems[i].detail.length > 40 ? '...' : ''}\n`
    }

    if (stockItems.length > 30) {
        txt += `\n_y ${stockItems.length - 30} artículos más..._ 📋`
    }

    txt += `

🛠️ *Gestión de las existencias:*
`
    txt += `🗑️ Eliminar: \`${m.prefix}hapusstok ${idx + 1} <número_artículo>
`
    txt += `✏️ Editar: \`${m.prefix}editstok ${idx + 1} <número_artículo>|<detalle_nuevo>
`
    txt += `➕ Añadir: \`${m.prefix}addstok ${idx + 1}|<detalle>\``

    return m.reply(txt)
}

export { pluginConfig as config, handler }
