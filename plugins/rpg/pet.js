import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'pet',
    alias: ['mypet', 'hewanku', 'peliharaan'],
    category: 'rpg',
    description: "Gestiona tus mascotas",
    usage: '.pet <feed/train/status>',
    example: '.pet status',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const PET_TYPES = {
    cat: { name: "🐱 Gato", baseStats: { attack: 5, defense: 3, luck: 5 }, evolve: 'lion' },
    dog: { name: "🐕 Perro", baseStats: { attack: 8, defense: 5, luck: 2 }, evolve: 'wolf' },
    bird: { name: "🐦 Ave", baseStats: { attack: 4, defense: 2, luck: 8 }, evolve: 'phoenix' },
    fish: { name: "🐟 Pez", baseStats: { attack: 2, defense: 2, luck: 10 }, evolve: 'dragon' },
    rabbit: { name: "🐰 Conejo", baseStats: { attack: 3, defense: 4, luck: 6 }, evolve: 'thunderbunny' },
    lion: { name: "🦁 León", baseStats: { attack: 15, defense: 10, luck: 8 }, evolve: null },
    wolf: { name: "🐺 Lobo", baseStats: { attack: 18, defense: 12, luck: 5 }, evolve: null },
    phoenix: { name: '🔥 Phoenix', baseStats: { attack: 12, defense: 8, luck: 15 }, evolve: null },
    dragon: { name: "🐉 Dragón", baseStats: { attack: 20, defense: 15, luck: 12 }, evolve: null },
    thunderbunny: { name: '⚡ Thunder Bunny', baseStats: { attack: 10, defense: 12, luck: 18 }, evolve: null }
}

const FOOD_ITEMS = {
    bread: { name: '🍞 Pan', hunger: 10, exp: 5 },
    fish: { name: "🐟 Pez", hunger: 20, exp: 10 },
    meat: { name: '🍖 Carne', hunger: 30, exp: 15 },
    fruit: { name: '🍎 Fruta', hunger: 15, exp: 8 },
    premium_food: { name: '⭐ Premium Food', hunger: 50, exp: 30 }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (!user.rpg.pet) {
        return m.reply(
            `🐾 *ᴘᴇᴛ sʏsᴛᴇᴍ*\n\n` +
            `¡No tienes mascotas!

` +
            `💡 *Cómo conseguir el pet:*
` +
            `> • \`${m.prefix}petshop\` - Comprar mascotas
` +
            `> • \`${m.prefix}breeding\` - Breeding pets\n` +
            `> • Despegue del dungeon/boss`
        )
    }
    
    const pet = user.rpg.pet
    const petInfo = PET_TYPES[pet.type]
    
    if (!action || !['feed', 'train', 'status', 'rename', 'evolve'].includes(action)) {
        const maxHunger = 100
        const hungerStatus = pet.hunger >= 70 ? "😊 Saciado/a" : pet.hunger >= 40 ? '😐 Normal' : "😰 ¡Hambriento/a!"
        
        let txt = `🐾 *ᴘᴇᴛ sᴛᴀᴛᴜs*\n\n`
        txt += `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n`
        txt += `┃ 🏷️ Nombre: *${pet.name}*\n`
        txt += `┃ 🐾 Tipo: *${petInfo.name}*\n`
        txt += `┃ 📊 Nivel: *${pet.level || 1}*\n`
        txt += `┃ ✨ EXP: *${pet.exp || 0}/${(pet.level || 1) * 100}*\n`
        txt += `┃ 🍖 Hunger: *${pet.hunger}/${maxHunger}* ${hungerStatus}\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 💪 *sᴛᴀᴛs* 」\n`
        txt += `┃ ⚔️ Attack: *${pet.stats?.attack || petInfo.baseStats.attack}*\n`
        txt += `┃ 🛡️ Defense: *${pet.stats?.defense || petInfo.baseStats.defense}*\n`
        txt += `┃ 🍀 Luck: *${pet.stats?.luck || petInfo.baseStats.luck}*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 📋 *ᴄᴏᴍᴍᴀɴᴅ* 」\n`
        txt += `┃ ${m.prefix}pet feed <food>\n`
        txt += `┃ ${m.prefix}pet train\n`
        txt += `┃ ${m.prefix}pet rename <name>\n`
        if (petInfo.evolve) {
            txt += `┃ ${m.prefix}pet evolve\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    if (action === 'feed') {
        const foodKey = args[1]?.toLowerCase()
        
        if (!foodKey) {
            let txt = `🍖 *ᴘᴇᴛ ꜰᴏᴏᴅ*\n\n`
            txt += `╭┈┈⬡「 🍽️ *COMIDA* 」\n`
            for (const [key, food] of Object.entries(FOOD_ITEMS)) {
                const have = user.inventory[key] || 0
                txt += `┃ ${food.name} (${have}x)\n`
                txt += `┃ 🍖 +${food.hunger} | ✨ +${food.exp} EXP\n`
                txt += `┃ → \`${key}\`\n┃\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
            return m.reply(txt)
        }
        
        const food = FOOD_ITEMS[foodKey]
        if (!food) {
            return m.reply(`❌ ¡Comida no encontrada!`)
        }
        
        if ((user.inventory[foodKey] || 0) < 1) {
            return m.reply(`❌ No tienes. ${food.name}!`)
        }
        
        if (pet.hunger >= 100) {
            return m.reply(`❌ ¡La mascota está llena!`)
        }
        
        user.inventory[foodKey]--
        if (user.inventory[foodKey] <= 0) delete user.inventory[foodKey]
        
        pet.hunger = Math.min(100, pet.hunger + food.hunger)
        pet.exp = (pet.exp || 0) + food.exp
        
        const expNeeded = (pet.level || 1) * 100
        if (pet.exp >= expNeeded) {
            pet.level = (pet.level || 1) + 1
            pet.exp -= expNeeded
            pet.stats = pet.stats || { ...petInfo.baseStats }
            pet.stats.attack += 2
            pet.stats.defense += 1
            pet.stats.luck += 1
        }
        
        db.save()
        
        return m.reply(
            `🍖 *ALIMENTANDO*\n\n` +
            `> ${pet.name} come ${food.name}!\n\n` +
            `╭┈┈⬡「 📊 *ᴜᴘᴅᴀᴛᴇ* 」\n` +
            `┃ 🍖 Hunger: *+${food.hunger}* (${pet.hunger}/100)\n` +
            `┃ ✨ EXP: *+${food.exp}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (action === 'train') {
        if (pet.hunger < 20) {
            return m.reply(`❌ ¡La mascota está muy hambrienta para practicar!`)
        }
        
        pet.hunger = Math.max(0, pet.hunger - 15)
        const expGain = 20 + Math.floor(Math.random() * 20)
        pet.exp = (pet.exp || 0) + expGain
        
        const expNeeded = (pet.level || 1) * 100
        let levelUp = false
        if (pet.exp >= expNeeded) {
            pet.level = (pet.level || 1) + 1
            pet.exp -= expNeeded
            pet.stats = pet.stats || { ...petInfo.baseStats }
            pet.stats.attack += 2
            pet.stats.defense += 1
            pet.stats.luck += 1
            levelUp = true
        }
        
        db.save()
        
        let txt = `🏋️ *ᴛʀᴀɪɴɪɴɢ ᴘᴇᴛ*\n\n`
        txt += `> ${pet.name} ¡entrena duro!

`
        txt += `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n`
        txt += `┃ ✨ EXP: *+${expGain}*\n`
        txt += `┃ 🍖 Hunger: *-15*\n`
        if (levelUp) {
            txt += `┃ 🎉 *LEVEL UP!* → Level ${pet.level}\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    if (action === 'rename') {
        const newName = args.slice(1).join(' ')
        if (!newName || newName.length < 2 || newName.length > 15) {
            return m.reply(`❌ ¡El nombre debe ser de 2-15 caracteres!`)
        }
        
        pet.name = newName
        db.save()
        
        return m.reply(`✅ Pet renamed to *${newName}*!`)
    }
    
    if (action === 'evolve') {
        if (!petInfo.evolve) {
            return m.reply(`❌ ¡Esta mascota ya no puede evolucionar!`)
        }
        
        if ((pet.level || 1) < 10) {
            return m.reply(`❌ Mascotas deben ser nivel 10 + para evolucionar! (Current: ${pet.level || 1})`)
        }
        
        const evolvedPet = PET_TYPES[petInfo.evolve]
        pet.type = petInfo.evolve
        pet.stats = { ...evolvedPet.baseStats }
        pet.level = 1
        pet.exp = 0
        
        db.save()
        
        return m.reply(
            `🎉 *ᴇᴠᴏʟᴜᴛɪᴏɴ!*\n\n` +
            `> ${pet.name} evolucionó a ${evolvedPet.name}!\n\n` +
            `╭┈┈⬡「 💪 *ɴᴇᴡ sᴛᴀᴛs* 」\n` +
            `┃ ⚔️ Attack: *${evolvedPet.baseStats.attack}*\n` +
            `┃ 🛡️ Defense: *${evolvedPet.baseStats.defense}*\n` +
            `┃ 🍀 Luck: *${evolvedPet.baseStats.luck}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
}

export { pluginConfig as config, handler }
