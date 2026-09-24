import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'inventory',
    alias: ['inv', 'tas', 'bag'],
    category: 'rpg',
    description: "Vea el contenido del inventario del RPG",
    usage: '.inventory',
    example: '.inventory',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const ITEMS = {
    common: { emote: '📦', name: 'Common Crate' },
    uncommon: { emote: '🛍️', name: 'Uncommon Crate' },
    mythic: { emote: '🎁', name: 'Mythic Crate' },
    legendary: { emote: '💎', name: 'Legendary Crate' },
    
    rock: { emote: '🪨', name: 'Piedra' },
    coal: { emote: '⚫', name: 'Carbón' },
    iron: { emote: '⛓️', name: 'Hierro' },
    gold: { emote: '🥇', name: 'Oro' },
    diamond: { emote: '💠', name: 'Diamante' },
    emerald: { emote: '💚', name: 'Emerald' },
    
    trash: { emote: '🗑️', name: 'Basura' },
    fish: { emote: '🐟', name: 'Pez' },
    prawn: { emote: '🦐', name: 'Camarón' },
    octopus: { emote: '🐙', name: 'Pulpo' },
    shark: { emote: '🦈', name: 'Tiburón' },
    whale: { emote: '🐳', name: 'Ballena' },
    
    potion: { emote: '🥤', name: 'Health Potion' },
    mpotion: { emote: '🧪', name: 'Mana Potion' },
    stamina: { emote: '⚡', name: 'Stamina Potion' }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    if (!user.inventory) user.inventory = {}
    
    let invText = `╭━━━━━━━━━━━━━━━━━╮\n`
    invText += `┃ 🎒 *ɪɴᴠᴇɴᴛᴏʀʏ ᴜsᴇʀ*\n`
    invText += `╰━━━━━━━━━━━━━━━━━╯\n\n`
    
    let hasItem = false
    const categories = {
        '📦 *ᴄʀᴀᴛᴇs*': ['common', 'uncommon', 'mythic', 'legendary'],
        '⛏️ *ᴍɪɴɪɴɢ*': ['rock', 'coal', 'iron', 'gold', 'diamond', 'emerald'],
        '🎣 *ꜰɪsʜɪɴɢ*': ['trash', 'fish', 'prawn', 'octopus', 'shark', 'whale'],
        '🧪 *ᴘᴏᴛɪᴏɴs*': ['potion', 'mpotion', 'stamina']
    }
    
    for (const [catName, items] of Object.entries(categories)) {
        let catText = ''
        for (const itemKey of items) {
            const count = user.inventory[itemKey] || 0
            if (count > 0) {
                const item = ITEMS[itemKey]
                catText += `┃ ${item.emote} ${item.name}: *${count}*\n`
                hasItem = true
            }
        }
        if (catText) {
            invText += `╭┈┈⬡「 ${catName} 」\n`
            invText += catText
            invText += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        }
    }
    
    if (!hasItem) {
        invText += `> *¡Inventario vacío!*
`
        invText += `> Utilice un comando RPG para obtener elementos.`
    } else {
        invText += `> Usa \`.use <item>\` para utilizar objetos.`
    }
    
    await m.reply(invText)
}

export { pluginConfig as config, handler }
