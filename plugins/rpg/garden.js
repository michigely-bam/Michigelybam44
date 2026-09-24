import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'garden',
    alias: ['kebun', 'farm', 'tanam'],
    category: 'rpg',
    description: "Jardinería y cosecha de cultivos",
    usage: '.garden <plant/harvest/status>',
    example: '.garden plant carrot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const CROPS = {
    carrot: { name: '🥕 Zanahoria', growTime: 300000, exp: 50, sellPrice: 30, seedPrice: 10 },
    tomato: { name: '🍅 Tomate', growTime: 600000, exp: 80, sellPrice: 50, seedPrice: 20 },
    corn: { name: '🌽 Maíz', growTime: 900000, exp: 120, sellPrice: 80, seedPrice: 35 },
    potato: { name: '🥔 Papa', growTime: 1200000, exp: 150, sellPrice: 100, seedPrice: 45 },
    strawberry: { name: '🍓 Fresa', growTime: 1800000, exp: 200, sellPrice: 150, seedPrice: 60 },
    watermelon: { name: '🍉 Sandía', growTime: 3600000, exp: 350, sellPrice: 300, seedPrice: 100 },
    pumpkin: { name: '🎃 Calabaza', growTime: 7200000, exp: 500, sellPrice: 500, seedPrice: 150 },
    herb: { name: '🌿 Hierba', growTime: 1500000, exp: 180, sellPrice: 120, seedPrice: 50 }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    if (!user.rpg.garden) user.rpg.garden = { plots: [], maxPlots: 3 }
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const cropName = args[1]?.toLowerCase()
    
    if (!action || !['plant', 'harvest', 'status', 'buy'].includes(action)) {
        let txt = `🌱 *JARDÍN - CULTIVAR*\n\n`
        txt += `╭┈┈⬡「 📋 *ᴄᴏᴍᴍᴀɴᴅ* 」\n`
        txt += `┃ ${m.prefix}garden status\n`
        txt += `┃ ${m.prefix}garden plant <crop>\n`
        txt += `┃ ${m.prefix}garden harvest\n`
        txt += `┃ ${m.prefix}garden buy <crop> <qty>\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `╭┈┈⬡「 🌾 *CULTIVOS* 」\n`
        for (const [key, crop] of Object.entries(CROPS)) {
            txt += `┃ ${crop.name} - ${formatTime(crop.growTime)}\n`
            txt += `┃ 💰 Venta: ${crop.sellPrice} | 🌱 Seed: ${crop.seedPrice}\n`
            txt += `┃ → \`${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        return m.reply(txt)
    }
    
    if (action === 'status') {
        const garden = user.rpg.garden
        let txt = `🌱 *ESTADO DEL JARDÍN*

`
        txt += `> Plot: ${garden.plots.length}/${garden.maxPlots}\n\n`
        
        if (garden.plots.length === 0) {
            txt += `> 🌾 El jardín está vacío.
> Usa \`${m.prefix}garden plant <crop>\``
        } else {
            txt += `╭┈┈⬡「 🌿 *ᴘʟᴏᴛs* 」\n`
            for (let i = 0; i < garden.plots.length; i++) {
                const plot = garden.plots[i]
                const crop = CROPS[plot.crop]
                const elapsed = Date.now() - plot.plantedAt
                const remaining = Math.max(0, crop.growTime - elapsed)
                const ready = remaining <= 0
                
                txt += `┃ Plot ${i + 1}: ${crop.name}\n`
                txt += `┃ ${ready ? "✅ ¡LISTO PARA COSECHAR!" : `🕕 ${formatTime(remaining)}`}\n`
                txt += `┃\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        return m.reply(txt)
    }
    
    if (action === 'buy') {
        if (!cropName) {
            return m.reply(`❌ ¡Elige una planta!

> Ejemplo: \`${m.prefix}garden buy carrot 5\``)
        }
        
        const crop = CROPS[cropName]
        if (!crop) {
            return m.reply(`❌ ¡Las plantas no se encuentran!`)
        }
        
        const qty = Math.max(1, parseInt(args[2]) || 1)
        const totalCost = crop.seedPrice * qty
        
        if ((user.koin || 0) < totalCost) {
            return m.reply(`¡❌ Saldo insuficiente! Necesita ${totalCost.toLocaleString()}`)
        }
        
        user.koin -= totalCost
        const seedKey = `${cropName}seed`
        user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty
        db.save()
        
        return m.reply(
            `✅ *COMPRAR SEMILLAS*\n\n` +
            `> 🌱 ${crop.name} Seed x${qty}\n` +
            `> 💰 -${totalCost.toLocaleString()}`
        )
    }
    
    if (action === 'plant') {
        if (!cropName) {
            return m.reply(`❌ ¡Elige una planta!

> Ejemplo: \`${m.prefix}garden plant carrot\``)
        }
        
        const crop = CROPS[cropName]
        if (!crop) {
            return m.reply(`❌ ¡Las plantas no se encuentran!`)
        }
        
        if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
            return m.reply(`❌ ¡La parcela está llena! Cosecha primero o mejora el jardín.`)
        }
        
        const seedKey = `${cropName}seed`
        if ((user.inventory[seedKey] || 0) < 1) {
            return m.reply(`❌ No hay semillas. ${crop.name}!

> Comprar: \`${m.prefix}garden buy ${cropName}\``)
        }
        
        user.inventory[seedKey]--
        if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey]
        
        user.rpg.garden.plots.push({
            crop: cropName,
            plantedAt: Date.now()
        })
        db.save()
        
        return m.reply(
            `🌱 *el cultivo fue exitoso*

` +
            `> ${crop.name} ¡plantado!
` +
            `> 🕕 La cosecha interior ${formatTime(crop.growTime)}`
        )
    }
    
    if (action === 'harvest') {
        const garden = user.rpg.garden
        const readyPlots = garden.plots.filter(p => {
            const crop = CROPS[p.crop]
            return Date.now() - p.plantedAt >= crop.growTime
        })
        
        if (readyPlots.length === 0) {
            return m.reply(`❌ ¡No hay cultivos listos para la cosecha todavía!`)
        }
        
        let totalExp = 0
        let harvestedItems = []
        
        for (const plot of readyPlots) {
            const crop = CROPS[plot.crop]
            const qty = Math.floor(Math.random() * 3) + 2
            user.inventory[plot.crop] = (user.inventory[plot.crop] || 0) + qty
            totalExp += crop.exp
            harvestedItems.push(`${crop.name} x${qty}`)
        }
        
        garden.plots = garden.plots.filter(p => {
            const crop = CROPS[p.crop]
            return Date.now() - p.plantedAt < crop.growTime
        })
        
        await addExpWithLevelCheck(sock, m, db, user, totalExp)
        db.save()
        
        await m.react('✅')
        return m.reply(
            `🌾 *la cosecha fue exitosa*

` +
            `╭┈┈⬡「 📦 *RESULTADO* 」\n` +
            harvestedItems.map(h => `┃ ${h}`).join('\n') + `\n` +
            `┃ ✨ EXP: +${totalExp}\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
}

export { pluginConfig as config, handler }
