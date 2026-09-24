import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'arena',
    alias: ['pvp', 'battle', 'fight'],
    category: 'rpg',
    description: "Combate en la arena PvP",
    usage: '.arena <@user>',
    example: '.arena @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 180,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
    if (!mentioned) {
        return m.reply(
            `⚔️ *ᴀʀᴇɴᴀ ᴘᴠᴘ*\n\n` +
            `¡Desafía a otro jugador para un duelo!

` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ ${m.prefix}arena @user\n` +
            `┃ Responder a los mensajes del usuario + ${m.prefix}arena\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `⚠️ *Riesgo:* perder = -20 % del saldo`
        )
    }
    
    if (mentioned === m.sender) {
        return m.reply(`❌ ¡No puedes luchar contigo mismo!`)
    }
    
    const opponent = db.getUser(mentioned)
    if (!opponent) {
        return m.reply(`❌ ¡El oponente no ha sido listado en la base de datos!`)
    }
    
    if (!opponent.rpg) opponent.rpg = {}
    
    const myHealth = user.rpg.health || 100
    const myAttack = (user.rpg.attack || 10) + (user.level || 1) * 2
    const myDefense = (user.rpg.defense || 5) + (user.level || 1)
    
    const oppHealth = opponent.rpg.health || 100
    const oppAttack = (opponent.rpg.attack || 10) + (opponent.level || 1) * 2
    const oppDefense = (opponent.rpg.defense || 5) + (opponent.level || 1)
    
    await m.react('⚔️')
    await m.reply(`⚔️ *COMBATE INICIADO...*\n\n> @${m.sender.split('@')[0]} vs @${mentioned.split('@')[0]}`, { mentions: [m.sender, mentioned] })
    await new Promise(r => setTimeout(r, 2000))
    
    let myHp = myHealth
    let oppHp = oppHealth
    let round = 0
    let battleLog = []
    
    while (myHp > 0 && oppHp > 0 && round < 10) {
        round++
        
        const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10))
        oppHp -= myDmg
        battleLog.push(`🔥 Atacan: *-${myDmg} HP*`)
        
        if (oppHp <= 0) break
        
        const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10))
        myHp -= oppDmg
        battleLog.push(`💢 El rival ataca: *-${oppDmg} HP*`)
    }
    
    const isWin = myHp > oppHp
    
    let txt = `⚔️ *RESULTADO COMBATE*\n\n`
    txt += `╭┈┈⬡「 📊 *sᴛᴀᴛs* 」\n`
    txt += `┃ 🧑 Tú: ${Math.max(0, myHp)}/${myHealth} HP\n`
    txt += `┃ 👤 Rival: ${Math.max(0, oppHp)}/${oppHealth} HP\n`
    txt += `┃ 🔄 Round: ${round}\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    txt += `📜 *Battle Log:*\n`
    txt += battleLog.slice(-6).map(l => `> ${l}`).join('\n')
    txt += `\n\n`
    
    if (isWin) {
        const expReward = 300 + (opponent.level || 1) * 50
        const goldReward = Math.floor((opponent.koin || 0) * 0.1)
        
        user.koin = (user.koin || 0) + goldReward
        opponent.koin = Math.max(0, (opponent.koin || 0) - goldReward)
        
        await addExpWithLevelCheck(sock, m, db, user, expReward)
        
        txt += `🎉 *VICTORIA!*\n`
        txt += `> ✨ EXP: +${expReward}\n`
        txt += `> 💰 Gold: +${goldReward.toLocaleString()}`
        
        await m.react('🏆')
    } else {
        const goldLoss = Math.floor((user.koin || 0) * 0.2)
        user.koin = Math.max(0, (user.koin || 0) - goldLoss)
        
        txt += `💀 *DERROTA!*\n`
        txt += `> 💸 Gold: -${goldLoss.toLocaleString()}`
        
        await m.react('💀')
    }
    
    db.setUser(m.sender, user)
    db.setUser(mentioned, opponent)
    db.save()
    
    return m.reply(txt, { mentions: [m.sender, mentioned] })
}

export { pluginConfig as config, handler }
