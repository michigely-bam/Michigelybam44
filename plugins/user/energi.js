import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'energi',
    alias: ['cekenergi', 'myenergi', 'energy', 'limit', 'ceklimit'],
    category: 'user',
    description: "Consulta la energía de un usuario",
    usage: '.energi [@user]',
    example: '.energi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Ilimitada'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let targetJid = m.sender
    let targetName = m.pushName || "Tú"
    
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    const isOwner = config.owner?.number?.includes(targetJid.replace(/[^0-9]/g, '')) || config.isOwner?.(targetJid)

    const dbToggle = db.setting('energi')
    const energiEnabled = dbToggle !== undefined ? dbToggle : (config.energi?.enabled !== false)

    let finalEnergi
    if (!energiEnabled || isOwner) {
        finalEnergi = -1
    } else if (user.isPremium) {
        finalEnergi = user.energi ?? config.energi?.premium ?? 100
    } else {
        finalEnergi = user.energi ?? config.energi?.default ?? 25
    }

    const isUnlimited = finalEnergi === -1
    const energiDisplay = formatNumber(finalEnergi)
    
    const isSelf = targetJid === m.sender
    
    let userStatus = 'Free'
    if (isOwner) userStatus = 'Owner'
    else if (user.isPremium) userStatus = 'Premium'
    if (!energiEnabled) userStatus += " (Energía OFF)"
    
    let text = `*〔 ⚡ INFORMACIÓN DE ENERGÍA 〕*

`

text += `*〔 👤 User 〕* ${targetName}\n`
text += `*〔 ⚡ Energía 〕* ${energiDisplay}\n`
text += `*〔 💎 Status 〕* ${userStatus}\n\n`
    
    if (!energiEnabled) {
        text += `🔌 El sistema de energía está deshabilitado - todo el comando es gratuito`
    } else if (isSelf && !isUnlimited && finalEnergi < 10) {
        text += `⚠️ ¡La energía está a punto de agotarse!
`
        text += `Usa \`.buyenergi\` para comprar`
    } else if (isUnlimited) {
        text += `✨ Energía ilimitada activada!`
    }
    
    await m.reply(text)
}

export { pluginConfig as config, handler }
