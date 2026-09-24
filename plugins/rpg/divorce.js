import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'divorce',
    alias: ['cerai', 'pisah'],
    category: 'rpg',
    description: "Divorciarse de la pareja",
    usage: '.divorce',
    example: '.divorce',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    if (!user.rpg.spouse) {
        return m.reply(
            `❌ *AÚN NO ESTÁS CASADO*\n\n` +
            `¡No estás casado!
` +
            `> Casarse con \`.marry @user\``
        )
    }
    
    const spouseJid = user.rpg.spouse
    const partner = db.getUser(spouseJid)
    
    const divorceCost = 25000
    if ((user.koin || 0) < divorceCost) {
        return m.reply(
            `❌ *saldo no es suficiente*

` +
            `> Tus monedas: Rp ${(user.koin || 0).toLocaleString('id-ID')}\n` +
            `> Necesidad: Rp ${divorceCost.toLocaleString('id-ID')}`
        )
    }
    
    user.koin -= divorceCost
    user.rpg.spouse = null
    user.rpg.marriedAt = null
    
    if (partner && partner.rpg) {
        partner.rpg.spouse = null
        partner.rpg.marriedAt = null
    }
    
    db.save()
    
    let txt = `💔 *DIVORCIO*\n\n`
    txt += `> 😢 @${m.sender.split('@')[0]} & @${spouseJid.split('@')[0]}\n`
    txt += `> ¡Divorcio oficial!
`
    txt += `> 💸 Costo: Rp ${divorceCost.toLocaleString('id-ID')}\n\n`
    txt += `> _Move on yaa..._`
    
    await m.reply(txt, { mentions: [m.sender, spouseJid] })
}

export { pluginConfig as config, handler }
