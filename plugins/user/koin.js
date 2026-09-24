import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'koin',
    alias: ['saldo', 'money', 'cash', 'coin', 'coins'],
    category: 'user',
    description: "Chequear las monedas de usuario",
    usage: '.koin [@user]',
    example: '.koin',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatKoin(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
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
    const koinDisplay = formatKoin(user.koin || 0)
    
    const isSelf = targetJid === m.sender
    
    let text = `*〔 💰 MONEDA INFO 〕*

`

text += `*〔 👤 User 〕* ${targetName}\n`
text += `*〔 💰 Monedas 〕* ${koinDisplay}\n`
const isOwner = config.isOwner(targetJid) ? 'Owner' : ''
const isPremium = user.isPremium ? 'Premium' : 'Free'

text += `*〔 💎 Status 〕* ${isOwner || isPremium}\n`

if (isSelf) {
  text += `\n*〔 🛒 SHOP 〕*\n`
  text += `• \`.buyenergi <jml>\` (1 = 100 monedas)
`
  text += `• \`.buyfitur\` (1 = 3000 monedas)
`
  text += `
_🎮 ¡Juega juegos para monedas!_`
}
    
    await m.reply(text)
}

export { pluginConfig as config, handler }
