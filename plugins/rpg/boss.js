import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'boss',
    alias: ['raidboss', 'bigboss'],
    category: 'rpg',
    description: "Lucha contra el jefe por el gran premio",
    usage: '.boss',
    example: '.boss',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 600,
    energi: 3,
    isEnabled: true
}

const BOSSES = [
    { name: '🐉 Elder Dragon', hp: 500, attack: 50, minLevel: 10, exp: 2000, gold: 5000, drops: ['dragonscale', 'dragonbone'] },
    { name: '👹 Demon Lord', hp: 400, attack: 60, minLevel: 15, exp: 2500, gold: 7000, drops: ['demonsoul', 'cursedgem'] },
    { name: '🧟 Undead King', hp: 350, attack: 45, minLevel: 8, exp: 1500, gold: 4000, drops: ['soulstone', 'ancientbone'] },
    { name: '🦑 Kraken', hp: 600, attack: 40, minLevel: 12, exp: 2200, gold: 6000, drops: ['krakententacle', 'seagem'] },
    { name: '🌋 Volcanic Titan', hp: 700, attack: 55, minLevel: 20, exp: 3000, gold: 10000, drops: ['titancore', 'lavagem'] },
    { name: '❄️ Frost Queen', hp: 450, attack: 50, minLevel: 18, exp: 2800, gold: 8000, drops: ['frostheart', 'icecrown'] },
    { name: '⚡ Thunder God', hp: 550, attack: 65, minLevel: 25, exp: 4000, gold: 15000, drops: ['thunderstone', 'divinecore'] }
]

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const userLevel = user.level || 1
    const availableBosses = BOSSES.filter(b => userLevel >= b.minLevel)
    
    if (availableBosses.length === 0) {
        const lowestBoss = BOSSES.reduce((a, b) => a.minLevel < b.minLevel ? a : b)
        return m.reply(
            `❌ *ʟᴇᴠᴇʟ ᴛᴇʀʟᴀʟᴜ ʀᴇɴᴅᴀʜ*\n\n` +
            `> Level kamu: ${userLevel}\n` +
            `> Minimal level: ${lowestBoss.minLevel}\n\n` +
            `💡 *Tips:* Farming EXP dari dungeon, fishing, mining, dll`
        )
    }
    
    const staminaCost = 50
    user.rpg.stamina = user.rpg.stamina ?? 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *sᴛᴀᴍɪɴᴀ ʜᴀʙɪs*\n\n` +
            `> Butuh ${staminaCost} stamina untuk boss fight.\n` +
            `> Stamina kamu: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    const boss = availableBosses[Math.floor(Math.random() * availableBosses.length)]
    
    await m.react('⚔️')
    await m.reply(`👹 *ʙᴏss ᴍᴜɴᴄᴜʟ!*\n\n${boss.name}\n\n> ❤️ HP: ${boss.hp}\n> ⚔️ ATK: ${boss.attack}`)
    await new Promise(r => setTimeout(r, 2000))
    
    const userAttack = (user.rpg.attack || 10) + userLevel * 3
    const userDefense = (user.rpg.defense || 5) + userLevel * 2
    const userMaxHp = (user.rpg.health || 100) + userLevel * 5
    
    let userHp = userMaxHp
    let bossHp = boss.hp
    let round = 0
    let battleLog = []
    
    while (userHp > 0 && bossHp > 0 && round < 15) {
        round++
        
        const playerDmg = Math.max(10, userAttack + Math.floor(Math.random() * 20) - 5)
        const critChance = Math.random()
        const finalPlayerDmg = critChance > 0.9 ? playerDmg * 2 : playerDmg
        bossHp -= finalPlayerDmg
        
        if (critChance > 0.9) {
            battleLog.push(`💥 *CRITICAL!* Kamu: -${finalPlayerDmg} HP`)
        } else {
            battleLog.push(`⚔️ Ataque:${finalPlayerDmg} HP`)
        }
        
        if (bossHp <= 0) break
        
        const bossDmg = Math.max(10, boss.attack - userDefense + Math.floor(Math.random() * 15))
        userHp -= bossDmg
        battleLog.push(`👹 Boss menyerang: -${bossDmg} HP`)
    }
    
    await m.reply(`⚔️ *ᴘᴇʀᴛᴀʀᴜɴɢᴀɴ...*\n\n${battleLog.slice(-6).map(l => `> ${l}`).join('\n')}`)
    await new Promise(r => setTimeout(r, 1500))
    
    const isWin = bossHp <= 0
    
    let txt = ``
    
    if (isWin) {
        const expReward = boss.exp + Math.floor(Math.random() * 500)
        const goldReward = boss.gold + Math.floor(Math.random() * 2000)
        
        user.koin = (user.koin || 0) + goldReward
        await addExpWithLevelCheck(sock, m, db, user, expReward)
        
        const droppedItems = []
        for (const drop of boss.drops) {
            if (Math.random() > 0.5) {
                const qty = Math.floor(Math.random() * 3) + 1
                user.inventory[drop] = (user.inventory[drop] || 0) + qty
                droppedItems.push(`${drop} x${qty}`)
            }
        }
        
        txt = `🏆 *ʙᴏss ᴅɪᴋᴀʟᴀʜᴋᴀɴ!*\n\n`
        txt += `> ${boss.name} telah dikalahkan!\n\n`
        txt += `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅ* 」\n`
        txt += `┃ ✨ EXP: *+${expReward.toLocaleString()}*\n`
        txt += `┃ 💰 Gold: *+${goldReward.toLocaleString()}*\n`
        if (droppedItems.length > 0) {
            txt += `┃ 📦 Loot: *${droppedItems.join(', ')}*\n`
        }
        txt += `┃ ❤️ HP tersisa: *${Math.max(0, userHp)}/${userMaxHp}*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        await m.react('🏆')
    } else {
        const goldLoss = Math.floor((user.koin || 0) * 0.15)
        user.koin = Math.max(0, (user.koin || 0) - goldLoss)
        user.rpg.health = Math.max(1, (user.rpg.health || 100) - 50)
        
        txt = `💀 *ᴋᴀʟᴀʜ ᴅᴀʀɪ ʙᴏss*\n\n`
        txt += `> ${boss.name} terlalu kuat!\n\n`
        txt += `╭┈┈⬡「 💔 *ᴘᴇɴᴀʟᴛʏ* 」\n`
        txt += `┃ 💸 Gold: *-${goldLoss.toLocaleString()}*\n`
        txt += `┃ ❤️ HP: *-50*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💡 *Tips:* ¡Equipos de nivel y actualización!`
        
        await m.react('💀')
    }
    
    db.save()
    return m.reply(txt)
}

export { pluginConfig as config, handler }