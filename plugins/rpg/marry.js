import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'marry',
    alias: ['nikah', 'wedding', 'propose'],
    category: 'rpg',
    description: "Casarse con otro jugador",
    usage: '.marry @user',
    example: '.marry @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!target) {
        return m.reply(
            `💒 *ᴍᴀʀʀʏ*\n\n` +
            `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
            `┃ > Marca a la pareja que quiere casarse
` +
            `┃ > \`.marry @user\`\n` +
            `┃ > Costo: Rp 50.000
` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*

> ¡No puedes casarte!`)
    }
    
    const partner = db.getUser(target) || db.setUser(target)
    if (!partner.rpg) partner.rpg = {}
    
    if (user.rpg.spouse) {
        return m.reply(
            `❌ *después de casarse*

` +
            `> Estás casado con @${user.rpg.spouse.split('@')[0]}!\n` +
            `> Divorcio primero con \`.divorce\``,
            { mentions: [user.rpg.spouse] }
        )
    }
    
    if (partner.rpg.spouse) {
        return m.reply(
            `❌ *target es casado*

` +
            `> @${target.split('@')[0]} ¡Estás casado con otra persona!`,
            { mentions: [target] }
        )
    }
    
    const marriageCost = 50000
    if ((user.koin || 0) < marriageCost) {
        return m.reply(
            `❌ *saldo no es suficiente*

` +
            `> Tus monedas: Rp ${(user.koin || 0).toLocaleString('id-ID')}\n` +
            `> Necesidad: Rp ${marriageCost.toLocaleString('id-ID')}`
        )
    }
    
    user.koin -= marriageCost
    user.rpg.spouse = target
    user.rpg.marriedAt = Date.now()
    partner.rpg.spouse = m.sender
    partner.rpg.marriedAt = Date.now()
    
    db.save()
    
    let txt = `💒 *MATRIMONIO*\n\n`
    txt += `> 💑 @${m.sender.split('@')[0]} & @${target.split('@')[0]}\n`
    txt += `> 💍 ¡Matrimonio oficial!
`
    txt += `> 💸 Costo: Rp ${marriageCost.toLocaleString('id-ID')}\n\n`
    txt += `> _¡Que dure para siempre! 💕_`
    
    await m.reply(txt, { mentions: [m.sender, target] })
}

export { pluginConfig as config, handler }
