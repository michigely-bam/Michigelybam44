
import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'crime',
    alias: ['steal', 'curi'],
    category: 'rpg',
    description: "Robar dinero (riesgo de captura + multa)",
    usage: '.crime',
    example: '.crime',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 300,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    await m.reply("🦹 *ROBANDO...*")
    await new Promise(r => setTimeout(r, 2000))
    
    const successRate = 0.5
    const isSuccess = Math.random() < successRate
    
    if (isSuccess) {
        const stolen = Math.floor(Math.random() * 15000) + 5000
        const expGain = Math.floor(stolen / 20)
        
        user.koin = (user.koin || 0) + stolen
        await addExpWithLevelCheck(sock, m, db, user, expGain)
        
        db.save()
        
        let txt = `✅ *ᴄʀɪᴍᴇ COMPLETADO*\n\n`
        txt += `> 🦹 ¡Lo robaste!
`
        txt += `> 💰 Resultado: *+Rp ${stolen.toLocaleString('id-ID')}*\n`
        txt += `> 🚄 Exp: *+${expGain}*`
        
        await m.reply(txt)
    } else {
        const fine = Math.floor(Math.random() * 10000) + 5000
        const actualFine = Math.min(fine, user.koin || 0)
        
        user.koin = Math.max(0, (user.koin || 0) - actualFine)
        user.rpg.health = Math.max(0, (user.rpg.health || 100) - 15)
        
        db.save()
        
        let txt = `❌ *ᴄʀɪᴍᴇ ERROR*\n\n`
        txt += `> 🚔 ¡Te atraparon la policía!
`
        txt += `> 💸 Multa: *-Rp ${actualFine.toLocaleString('id-ID')}*\n`
        txt += `> ❤️ Salud: *-15* (recibiste una paliza)`
        
        await m.reply(txt)
    }
}

export { pluginConfig as config, handler }
