import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'alchemy',
    alias: ['potion', 'brew', 'ramuan'],
    category: 'rpg',
    description: "Crea pociones con hierbas y otros materiales",
    usage: '.alchemy <potion>',
    example: '.alchemy healthpotion',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

const POTIONS = {
    healthpotion: { name: '❤️ Poción de salud', materials: { herb: 3 }, effect: 'Recupera 50 de HP', exp: 80, result: 'healthpotion' },
    manapotion: { name: '💙 Poción de maná', materials: { herb: 2, flower: 1 }, effect: "Recupera 50 de maná", exp: 90, result: 'manapotion' },
    staminapotion: { name: '⚡ Poción de resistencia', materials: { herb: 2, mushroom: 1 }, effect: 'Recupera 30 de resistencia', exp: 100, result: 'staminapotion' },
    strengthpotion: { name: '💪 Poción de fuerza', materials: { herb: 3, dragonscale: 1 }, effect: "+20 ATK (5 minutos)", exp: 200, result: 'strengthpotion' },
    defensepotion: { name: '🛡️ Poción de defensa', materials: { herb: 3, iron: 2 }, effect: "+15 DEF (5 minutos)", exp: 180, result: 'defensepotion' },
    luckpotion: { name: '🍀 Poción de suerte', materials: { herb: 5, diamond: 1 }, effect: "+30% de probabilidad de obtener objetos (10 minutos)", exp: 300, result: 'luckpotion' },
    exppotion: { name: '✨ Poción de EXP', materials: { herb: 4, gold: 2 }, effect: "+50% de EXP (15 minutos)", exp: 250, result: 'exppotion' },
    antidote: { name: '💊 Antídoto', materials: { herb: 2 }, effect: "Cura el veneno", exp: 50, result: 'antidote' },
    elixir: { name: '🧪 Elixir', materials: { herb: 10, diamond: 2, gold: 5 }, effect: "Restaura todas las estadísticas", exp: 500, result: 'elixir' }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const potionName = args[0]?.toLowerCase()
    
    if (!potionName) {
        let txt = `🧪 *ALQUIMIA - CREAR POCIÓN*\n\n`
        txt += `╭┈┈⬡「 📜 *RECETA* 」
`
        
        for (const [key, pot] of Object.entries(POTIONS)) {
            const mats = Object.entries(pot.materials).map(([m, qty]) => `${qty}x ${m}`).join(', ')
            txt += `┃ ${pot.name}\n`
            txt += `┃ 📦 Materiales: ${mats}\n`
            txt += `┃ 💫 Efecto: ${pot.effect}\n`
            txt += `┃ → \`${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💡 *Consejos:* Obtenga la hierba de un jardín o dungeon`
        
        return m.reply(txt)
    }
    
    const potion = POTIONS[potionName]
    if (!potion) {
        return m.reply(`❌ ¡La prescripción no se encuentra!

> Escribe \`${m.prefix}alchemy\` para ver la lista.`)
    }
    
    const missingMaterials = []
    for (const [material, needed] of Object.entries(potion.materials)) {
        const have = user.inventory[material] || 0
        if (have < needed) {
            missingMaterials.push(`${material}: ${have}/${needed}`)
        }
    }
    
    if (missingMaterials.length > 0) {
        return m.reply(
            `❌ *FALTAN MATERIALES*\n\n` +
            `> Para hacer ${potion.name}:\n\n` +
            missingMaterials.map(m => `> ❌ ${m}`).join('\n')
        )
    }
    
    await m.react('🧪')
    await m.reply(`🧪 *PREPARANDO ${potion.name.toUpperCase()}...*`)
    await new Promise(r => setTimeout(r, 2000))
    
    for (const [material, needed] of Object.entries(potion.materials)) {
        user.inventory[material] -= needed
        if (user.inventory[material] <= 0) delete user.inventory[material]
    }
    
    user.inventory[potion.result] = (user.inventory[potion.result] || 0) + 1
    
    await addExpWithLevelCheck(sock, m, db, user, potion.exp)
    db.save()
    
    await m.react('✅')
    return m.reply(
        `✅ *la alquimia fue exitosa*

` +
        `╭┈┈⬡「 🧪 *RESULTADO* 」\n` +
        `┃ 📦 Item: *${potion.name}*\n` +
        `┃ 💫 Efecto: *${potion.effect}*\n` +
        `┃ ✨ EXP: *+${potion.exp}*\n` +
        `╰┈┈┈┈┈┈┈┈⬡`
    )
}

export { pluginConfig as config, handler }
