import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'hunt',
    alias: ['berburu', 'hunting'],
    category: 'rpg',
    description: "Caza animales para conseguir carne y piel",
    usage: '.hunt',
    example: '.hunt',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 90,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const staminaCost = 25
    user.rpg.stamina = user.rpg.stamina || 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *RESISTENCIA AGOTADA*

` +
            `> Necesita ${staminaCost} stamina para la caza.
` +
            `> Tu resistencia: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.reply("🏹 *CAZANDO...*")
    await new Promise(r => setTimeout(r, 2500))
    
    const animals = [
        { name: "🐰 Conejo", item: 'rabbit', chance: 50, exp: 100 },
        { name: '🦌 Ciervo', item: 'deer', chance: 30, exp: 200 },
        { name: '🐗 Jabalí', item: 'boar', chance: 20, exp: 300 },
        { name: '🐻 Oso', item: 'bear', chance: 10, exp: 500 },
        { name: "🦁 León", item: 'lion', chance: 5, exp: 800 },
        { name: "🐉 Dragón", item: 'dragon', chance: 1, exp: 2000 }
    ]
    
    const rand = Math.random() * 100
    let caught = null
    
    for (const animal of animals.sort((a, b) => a.chance - b.chance)) {
        if (rand <= animal.chance) {
            caught = animal
            break
        }
    }
    
    if (!caught) {
        caught = animals.find(a => a.item === 'rabbit')
    }
    
    user.inventory[caught.item] = (user.inventory[caught.item] || 0) + 1
    const levelResult = await addExpWithLevelCheck(sock, m, db, user, caught.exp)
    
    db.save()
    
    let txt = `🏹 *la caza terminó*

`
    txt += `╭┈┈⬡「 🎯 *RESULTADO* 」\n`
    txt += `┃ ${caught.name}: *+1*\n`
    txt += `┃ 🚄 Exp: *+${caught.exp}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
