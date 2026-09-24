import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'merchant',
    alias: ['npc', 'toko', 'tokoku'],
    category: 'rpg',
    description: "Artículos de comercio a mercadería NPC",
    usage: '.merchant <buy/sell> <item> <qty>',
    example: '.merchant buy potion 5',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const SHOP_ITEMS = {
    potion: { name: '🧪 Poción', buyPrice: 100, sellPrice: 50, desc: 'Recupera 50 de HP' },
    manapotion: { name: '💙 Poción de maná', buyPrice: 150, sellPrice: 75, desc: "Recupera 50 de maná" },
    antidote: { name: '💊 Antídoto', buyPrice: 80, sellPrice: 40, desc: "Cura el veneno" },
    bread: { name: '🍞 Pan', buyPrice: 30, sellPrice: 15, desc: 'Recupera 10 de resistencia' },
    energydrink: { name: '⚡ Bebida energética', buyPrice: 200, sellPrice: 100, desc: 'Recupera 50 de resistencia' },
    pickaxe: { name: '⛏️ Pico', buyPrice: 500, sellPrice: 250, desc: "Para la minería" },
    fishingrod: { name: '🎣 Caña de pescar', buyPrice: 400, sellPrice: 200, desc: "Para pescar" },
    wood: { name: '🪵 Madera', buyPrice: 50, sellPrice: 25, desc: "Material básico" },
    iron: { name: '🔩 Hierro', buyPrice: 80, sellPrice: 40, desc: "Material metálico" },
    leather: { name: '🧶 Cuero', buyPrice: 60, sellPrice: 30, desc: 'Material para armaduras' },
    string: { name: '🧵 Hilo', buyPrice: 40, sellPrice: 20, desc: "Material para arcos" },
    herb: { name: '🌿 Hierba', buyPrice: 70, sellPrice: 35, desc: "Material de alquimia" },
    gold: { name: '🪙 Oro', buyPrice: 500, sellPrice: 250, desc: "Material raro" },
    diamond: { name: '💎 Diamante', buyPrice: 2000, sellPrice: 1000, desc: "Material de lujo" }
}

function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const itemKey = args[1]?.toLowerCase()
    const qty = Math.max(1, parseInt(args[2]) || 1)
    
    if (!action || !['buy', 'sell', 'list'].includes(action)) {
        let txt = `🏪 *ᴍᴇʀᴄʜᴀɴᴛ sʜᴏᴘ*\n\n`
        txt += `> ¡Bienvenido a la tienda!

`
        txt += `╭┈┈⬡「 📋 *ᴄᴏᴍᴍᴀɴᴅ* 」\n`
        txt += `┃ ${m.prefix}merchant list\n`
        txt += `┃ ${m.prefix}merchant buy <item> <qty>\n`
        txt += `┃ ${m.prefix}merchant sell <item> <qty>\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💰 *Balance:* ${(user.koin || 0).toLocaleString()}`
        return m.reply(txt)
    }
    
    if (action === 'list') {
        let txt = `🏪 *LISTA DE ARTÍCULOS*\n\n`
        txt += `╭┈┈⬡「 📦 *sʜᴏᴘ* 」\n`
        
        for (const [key, item] of Object.entries(SHOP_ITEMS)) {
            txt += `┃ ${item.name}\n`
            txt += `┃ 💵 Comprar: ${item.buyPrice.toLocaleString()}\n`
            txt += `┃ 💰 Venta: ${item.sellPrice.toLocaleString()}\n`
            txt += `┃ 📝 ${item.desc}\n`
            txt += `┃ → \`${key}\`\n`
            txt += `┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    if (action === 'buy') {
        if (!itemKey) {
            return m.reply(`❌ ¡Elige un artículo!\n\n> Ejemplo: \`${m.prefix}merchant buy potion 5\``)
        }
        
        const item = SHOP_ITEMS[itemKey]
        if (!item) {
            return m.reply(`❌ ¡El artículo no se encuentra!

> Escribe \`${m.prefix}merchant list\` para ver la lista.`)
        }
        
        const totalCost = item.buyPrice * qty
        if ((user.koin || 0) < totalCost) {
            return m.reply(
                `❌ *SALDO INSUFICIENTE*\n\n` +
                `> Precio: ${totalCost.toLocaleString()}\n` +
                `> Balance: ${(user.koin || 0).toLocaleString()}`
            )
        }
        
        user.koin -= totalCost
        user.inventory[itemKey] = (user.inventory[itemKey] || 0) + qty
        db.save()
        
        return m.reply(
            `✅ *la compra fue exitosa*

` +
            `╭┈┈⬡「 🛒 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📦 Item: *${item.name}*\n` +
            `┃ 📊 Qty: *${qty}*\n` +
            `┃ 💵 Total: *-${totalCost.toLocaleString()}*\n` +
            `┃ 💰 Restante: *${user.koin.toLocaleString()}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (action === 'sell') {
        if (!itemKey) {
            return m.reply(`❌ ¡Elige un artículo!\n\n> Ejemplo: \`${m.prefix}merchant sell iron 10\``)
        }
        
        const item = SHOP_ITEMS[itemKey]
        if (!item) {
            return m.reply(`❌ ¡Los artículos no se pueden vender a la mercancía!`)
        }
        
        const have = user.inventory[itemKey] || 0
        if (have < qty) {
            return m.reply(
                `❌ *FALTAN ARTÍCULOS*\n\n` +
                `> Tiene: ${have}\n` +
                `> Vas a vender: ${qty}`
            )
        }
        
        const totalEarn = item.sellPrice * qty
        user.koin = (user.koin || 0) + totalEarn
        user.inventory[itemKey] -= qty
        if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
        db.save()
        
        return m.reply(
            `✅ *las ventas fueron exitosas*

` +
            `╭┈┈⬡「 💰 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📦 Item: *${item.name}*\n` +
            `┃ 📊 Qty: *${qty}*\n` +
            `┃ 💵 Total: *+${totalEarn.toLocaleString()}*\n` +
            `┃ 💰 Balance: *${user.koin.toLocaleString()}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
}

export { pluginConfig as config, handler }
