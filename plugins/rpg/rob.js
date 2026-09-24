import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'rob',
    alias: ['rampok', 'mug'],
    category: 'rpg',
    description: "Robar el dinero de otros jugadores.",
    usage: '.rob @user',
    example: '.rob @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 600,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!target) {
        return m.reply(
            `🦹 *ʀᴏʙ*\n\n` +
            `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
            `¡Marca el objetivo que quiere ser robado!
` +
            `┃ > \`.rob @user\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*

> ¡No puedes robarte!`)
    }
    
    const robber = db.getUser(m.sender)
    const victim = db.getUser(target)
    
    if (!victim) {
        return m.reply(`❌ *ᴛᴀʀɢᴇᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ*

> ¡Objetivo no encontrado en la base de datos!`)
    }
    
    if ((victim.koin || 0) < 1000) {
        return m.reply(`❌ *OBJETIVO DEMASIADO POBRE*

> ¡El objetivo es demasiado pobre para ser robado!`)
    }
    
    if (!robber.rpg) robber.rpg = {}
    robber.rpg.health = robber.rpg.health || 100
    
    if (robber.rpg.health < 30) {
        return m.reply(
            `❌ *SALUD DEMASIADO BAJA*\n\n` +
            `> ¡Necesitas al menos 30 HP para asaltar!
` +
            `> Tu salud: ${robber.rpg.health} HP`
        )
    }
    
    await sock.sendMessage(m.chat, { text: `🦹 *ASALTANDO...*`, contextInfo: getRpgContextInfo('🦹 ROB', 'Robbing!') }, { quoted: m })
    await new Promise(r => setTimeout(r, 2500))
    
    const successRate = 0.4
    const isSuccess = Math.random() < successRate
    
    if (isSuccess) {
        const maxSteal = Math.floor((victim.koin || 0) * 0.3)
        const stolen = Math.floor(Math.random() * maxSteal) + 1000
        
        victim.koin = (victim.koin || 0) - stolen
        robber.koin = (robber.koin || 0) + stolen
        
        const expGain = 300
        await addExpWithLevelCheck(sock, m, db, robber, expGain)
        
        db.save()
        
        let txt = `✅ *ʀᴏʙ COMPLETADO*\n\n`
        txt += `> 🦹 Te las arreglaste para robar @${target.split('@')[0]}!\n`
        txt += `> 💰 Botín: *+Rp ${stolen.toLocaleString('id-ID')}*\n`
        txt += `> 🚄 Exp: *+${expGain}*`
        
        await m.reply(txt, { mentions: [target] })
    } else {
        const fine = Math.floor(Math.random() * 10000) + 5000
        const actualFine = Math.min(fine, robber.koin || 0)
        const healthLoss = 25
        
        robber.koin = Math.max(0, (robber.koin || 0) - actualFine)
        robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss)
        
        db.save()
        
        let txt = `❌ *ʀᴏʙ ERROR*\n\n`
        txt += `> 🚨 ¡Te atraparon y te golpearon!
`
        txt += `> 💸 Multa: *-Rp ${actualFine.toLocaleString('id-ID')}*\n`
        txt += `> ❤️ Health: *-${healthLoss}*`
        
        await m.reply(txt)
    }
}

export { pluginConfig as config, handler }
