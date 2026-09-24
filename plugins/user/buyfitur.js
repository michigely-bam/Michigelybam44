import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'buyfitur',
    alias: ['belifitur', 'purchasefeature', 'buyfeature'],
    category: 'user',
    description: "Compra funciones prémium (1 función = 3000 monedas)",
    usage: '.buyfitur [nombre_función]',
    example: '.buyfitur',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_FEATURE = 3000

const PREMIUM_FEATURES = [
    { id: 'sticker', name: 'Stickers ilimitados', desc: 'Comandos de stickers sin límites' },
    { id: 'downloader', name: 'Downloader Pro', desc: "Descarga sin límites" },
    { id: 'ai', name: 'Acceso a IA', desc: "Acceso a IA de alta calidad" },
    { id: 'tools', name: 'Herramientas avanzadas', desc: "Herramientas exclusivas" },
    { id: 'game', name: 'Bonificación de juegos', desc: 'Recompensas dobles en juegos' }
]

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    const featureName = m.args[0]?.toLowerCase()
    
    if (user.isPremium || config.isPremium(m.sender)) {
        return m.reply(
            `✨ *ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ*\n\n` +
            `> ¡Ya eres usuario prémium!\n` +
            `> Todas las funciones están desbloqueadas.`
        )
    }
    
    if (!featureName) {
        const unlockedFeatures = user.unlockedFeatures || []
        
        let text = `╭━━━━━━━━━━━━━━━━━╮\n`
        text += `┃  🛒 *COMPRAR FUNCIONES*\n`
        text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
        
        text += `> Precio: *${formatNumber(PRICE_PER_FEATURE)} monedas por función*\n`
        text += `> Monedas: *${formatNumber(user.koin || 0)}*\n\n`
        
        text += `╭┈┈⬡「 📋 *FUNCIONES* 」\n`
        
        for (const feature of PREMIUM_FEATURES) {
            const isUnlocked = unlockedFeatures.includes(feature.id)
            const status = isUnlocked ? '✅' : '🔒'
            text += `┃ ${status} *${feature.name}*\n`
            text += `┃    _${feature.desc}_\n`
            text += `┃    ID: \`${feature.id}\`\n`
            text += `┃\n`
        }
        
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `> Utiliza: \`.buyfitur <id>\`\n`
        text += `> También puedes hacerte *Prémium* para desbloquearlas todas.`
        
        await m.reply(text)
        return
    }
    
    const feature = PREMIUM_FEATURES.find(f => f.id === featureName)
    
    if (!feature) {
        return m.reply(
            `❌ *ERROR*\n\n` +
            `> No se encontró la función \`${featureName}\`.\n` +
            `> Escribe \`.buyfitur\` para ver la lista`
        )
    }
    
    const unlockedFeatures = user.unlockedFeatures || []
    
    if (unlockedFeatures.includes(feature.id)) {
        return m.reply(`❌ *ERROR*\n\n> La función \`${feature.name}\` ya está desbloqueada.`)
    }
    
    if ((user.koin || 0) < PRICE_PER_FEATURE) {
        return m.reply(
            `❌ *ERROR*\n\n` +
            `> ¡No tienes suficientes monedas!\n` +
            `> Necesitas: *${formatNumber(PRICE_PER_FEATURE)}*\n` +
            `> Tienes: *${formatNumber(user.koin || 0)}*`
        )
    }
    
    db.updateKoin(m.sender, -PRICE_PER_FEATURE)
    unlockedFeatures.push(feature.id)
    db.setUser(m.sender, { unlockedFeatures })
    
    const newKoin = db.getUser(m.sender).koin
    
    m.react('✅')
    
    await m.reply(
        `✅ *FUNCIÓN DESBLOQUEADA*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 🎁 Función: *${feature.name}*\n` +
        `┃ 💵 Precio: *-${formatNumber(PRICE_PER_FEATURE)} monedas*\n` +
        `┃ 💰 Saldo restante: *${formatNumber(newKoin)}*\n` +
        `╰┈┈⬡\n\n` +
        `> _${feature.desc}_\n\n` +
        `> 💡 Consejo: hazte *Prémium* para desbloquearlo todo.`
    )
}

export { pluginConfig as config, handler, PREMIUM_FEATURES }
