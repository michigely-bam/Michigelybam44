import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'blacksmith',
    alias: ['tempa', 'forge', 'pandai'],
    category: 'rpg',
    description: "Forge weapons and armor from material",
    usage: '.blacksmith <item>',
    example: '.blacksmith sword',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 120,
    energi: 1,
    isEnabled: true
}

const RECIPES = {
    sword: { materials: { iron: 3, wood: 2 }, result: 'sword', name: '⚔️ Espada de hierro', exp: 200, price: 500 },
    shield: { materials: { iron: 4, leather: 2 }, result: 'shield', name: '🛡️ Escudo de hierro', exp: 250, price: 600 },
    helmet: { materials: { iron: 2, leather: 1 }, result: 'helmet', name: '⛑️ Casco de hierro', exp: 150, price: 400 },
    armor: { materials: { iron: 5, leather: 3 }, result: 'armor', name: '🦺 Armadura de hierro', exp: 350, price: 800 },
    axe: { materials: { iron: 2, wood: 3 }, result: 'axe', name: '🪓 Hacha de hierro', exp: 180, price: 450 },
    pickaxe: { materials: { iron: 3, wood: 2 }, result: 'pickaxe', name: '⛏️ Pico', exp: 180, price: 450 },
    bow: { materials: { wood: 4, string: 2 }, result: 'bow', name: '🏹 Arco', exp: 200, price: 500 },
    arrow: { materials: { wood: 1, iron: 1 }, result: 'arrow', name: '🏹 Flechas x10', exp: 50, price: 100, qty: 10 },
    goldsword: { materials: { gold: 5, diamond: 2, iron: 3 }, result: 'goldsword', name: '🗡️ Espada de oro', exp: 500, price: 2000 },
    diamondarmor: { materials: { diamond: 8, iron: 5, leather: 3 }, result: 'diamondarmor', name: '💎 Armadura de diamante', exp: 800, price: 5000 }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const itemName = args[0]?.toLowerCase()
    
    if (!itemName) {
        let txt = `🔨 *HERRERÍA — FORJAR OBJETO*

`
        txt += `> ¡Forjando armas y armaduras de materiales!

`
        txt += `╭┈┈⬡「 📜 *RECETA* 」
`
        
        for (const [key, recipe] of Object.entries(RECIPES)) {
            const mats = Object.entries(recipe.materials).map(([m, qty]) => `${qty}x ${m}`).join(', ')
            txt += `┃ ${recipe.name}\n`
            txt += `┃ → ${m.prefix}blacksmith ${key}\n`
            txt += `┃ 📦 Materiales: ${mats}\n`
            txt += `┃ ✨ EXP: +${recipe.exp}\n`
            txt += `┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💡 *Consejos:* Farming iron, wood, leather from hunting, mining, etc.`
        
        return m.reply(txt)
    }
    
    const recipe = RECIPES[itemName]
    if (!recipe) {
        return m.reply(`❌ ¡La prescripción no se encuentra!

> Escribe \`${m.prefix}blacksmith\` para ver la lista de recetas.`)
    }
    
    const missingMaterials = []
    for (const [material, needed] of Object.entries(recipe.materials)) {
        const have = user.inventory[material] || 0
        if (have < needed) {
            missingMaterials.push(`${material}: ${have}/${needed}`)
        }
    }
    
    if (missingMaterials.length > 0) {
        return m.reply(
            `❌ *FALTAN MATERIALES*\n\n` +
            `> Para hacer ${recipe.name}:\n\n` +
            missingMaterials.map(m => `> ❌ ${m}`).join('\n')
        )
    }
    
    await m.react('🔨')
    await m.reply(`🔨 *FORJANDO ${recipe.name.toUpperCase()}...*`)
    await new Promise(r => setTimeout(r, 2000))
    
    for (const [material, needed] of Object.entries(recipe.materials)) {
        user.inventory[material] -= needed
        if (user.inventory[material] <= 0) delete user.inventory[material]
    }
    
    const resultQty = recipe.qty || 1
    user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty
    
    await addExpWithLevelCheck(sock, m, db, user, recipe.exp)
    db.save()
    
    await m.react('✅')
    
    let txt = `✅ *forjado correctamente*

`
    txt += `╭┈┈⬡「 📦 *RESULTADO* 」\n`
    txt += `┃ 🔨 Item: *${recipe.name}*\n`
    txt += `┃ 📊 Cantidad: *+${resultQty}*\n`
    txt += `┃ ✨ EXP: *+${recipe.exp}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡`
    
    return m.reply(txt)
}

export { pluginConfig as config, handler }
