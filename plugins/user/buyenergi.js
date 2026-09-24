import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'buyenergi',
    alias: ['belienergi', 'purchaseenergi', 'buyenergy'],
    category: 'user',
    description: "Comprar energía con una moneda (1 energía = 100 monedas)",
    usage: '.buyenergi <cantidad>',
    example: '.buyenergi 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_ENERGI = 100

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const amount = parseInt(m.args[0]) || 0
    
    if (amount <= 0) {
        const user = db.getUser(m.sender) || db.setUser(m.sender)
        
        return m.reply(
            `🛒 *ʙᴜʏ ENERGÍA*\n\n` +
            `╭┈┈⬡「 💰 *ɪɴꜰᴏ* 」\n` +
            `┃ 💵 PRECIO: *${PRICE_PER_ENERGI}*monedas/energía
` +
            `┃ 💰 TUS MONEDAS: *${formatNumber(user.koin || 0)}*\n` +
            `╰┈┈⬡\n\n` +
            `> Utilice: \`.buyenergi <cantidad>\`

` +
            `\`Ejemplo: ${m.prefix}buyenergi 10\``
        )
    }
    
    const totalPrice = amount * PRICE_PER_ENERGI
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    
    if ((user.koin || 0) < totalPrice) {
        return m.reply(
            `❌ *ERROR*\n\n` +
            `> ¡No tienes suficientes monedas!
` +
            `> Necesita: *${formatNumber(totalPrice)}*\n` +
            `> Tienes: *${formatNumber(user.koin || 0)}*`
        )
    }
    
    db.updateKoin(m.sender, -totalPrice)
    
    if (user.energi === -1) {
        m.react('✅')
        return m.reply(
            `✅ *la compra fue exitosa*

` +
            `¡Pero ya tienes energía ilimitada!
` +
            `> Las monedas fueron devueltas.`
        )
    }
    
    const newEnergi = db.updateEnergi(m.sender, amount)
    const newKoin = db.getUser(m.sender).koin
    
    m.react('✅')
    
    await m.reply(
        `✅ *la compra fue exitosa*

` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ ⚡ ENERGÍA: *+${formatNumber(amount)}*\n` +
        `┃ 💵 PRECIO: *-${formatNumber(totalPrice)}* monedas
` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 💰 *SALDO* 」
` +
        `┃ ⚡ ENERGÍA: *${formatNumber(newEnergi)}*\n` +
        `┃ 💰 MONEDAS: *${formatNumber(newKoin)}*\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
