import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'delenergi',
    alias: ['kurangenergi', 'removeenergi', 'hapusenergi', 'delenergy'],
    category: 'owner',
    description: "Reduce la energía de un usuario",
    usage: '.delenergi <cantidad> @usuario',
    example: '.delenergi 50 @user',
    isOwner: true,
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

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    const amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `⚡ *RESTAR ENERGÍA*\n\n` +
            `> \`.delenergi <cantidad>\` - de sí mismo
` +
            `> \`.delenergi <cantidad> @usuario\` - del usuario

` +
            `\`Ejemplo: ${m.prefix}delenergi 50\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌ *falló*

> El número debe ser superior a 0`)
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌ *falló*

> Usuario no encontrado en la base de datos`)
    }
    
    if (user.energi === -1) {
        db.setUser(targetJid, { energi: 25 })
    }
    
    const newEnergi = db.updateEnergi(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ENERGÍA REDUCIDA*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴜsᴇʀ: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ RESTADO: *-${formatNumber(amount)}*\n` +
        `┃ ⚡ restante: *${formatNumber(newEnergi)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
