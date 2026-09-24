import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'petshop',
    alias: ['tokopet', 'buypet', 'belipet'],
    category: 'rpg',
    description: "Compra mascotas en la tienda",
    usage: '.petshop <buy> <pet>',
    example: '.petshop buy cat',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const PETS_FOR_SALE = {
    cat: { name: "🐱 Gato", price: 5000, desc: "Altura alta, medio de ataque" },
    dog: { name: "🐕 Perro", price: 6000, desc: "Ataque alto y buena defensa" },
    bird: { name: "🐦 Ave", price: 4500, desc: "La suerte es muy alta." },
    fish: { name: "🐟 Pez", price: 3000, desc: "Barato y con mucha suerte" },
    rabbit: { name: "🐰 Conejo", price: 5500, desc: "Equilibrio todos los puntos" }
}

function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const petKey = args[1]?.toLowerCase()
    
    if (!action || action !== 'buy') {
        let txt = `🏪 *ᴘᴇᴛ sʜᴏᴘ*\n\n`
        txt += `> ¡Compra una mascota para montar contigo!

`
        txt += `╭┈┈⬡「 🐾 *ᴘᴇᴛs* 」\n`
        
        for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
            txt += `┃ ${pet.name}\n`
            txt += `┃ 💰 Precio: ${pet.price.toLocaleString()}\n`
            txt += `┃ 📝 ${pet.desc}\n`
            txt += `┃ → \`${m.prefix}petshop buy ${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💰 *Balance:* ${(user.koin || 0).toLocaleString()}`
        
        return m.reply(txt)
    }
    
    if (action === 'buy') {
        if (!petKey) {
            return m.reply(`❌ ¡Elija una mascota!

> Ejemplo: \`${m.prefix}petshop buy cat\``)
        }
        
        if (user.rpg.pet) {
            return m.reply(`❌ Vender primero o usar una panadería.`)
        }
        
        const petToBuy = PETS_FOR_SALE[petKey]
        if (!petToBuy) {
            return m.reply(`❌ ¡No hay mascotas!`)
        }
        
        if ((user.koin || 0) < petToBuy.price) {
            return m.reply(
                `❌ *SALDO INSUFICIENTE*\n\n` +
                `> Precio: ${petToBuy.price.toLocaleString()}\n` +
                `> Balance: ${(user.koin || 0).toLocaleString()}`
            )
        }
        
        user.koin -= petToBuy.price
        
        user.rpg.pet = {
            type: petKey,
            name: petToBuy.name.split(' ')[1] || 'My Pet',
            level: 1,
            exp: 0,
            hunger: 80,
            stats: null
        }
        
        db.save()
        
        return m.reply(
            `🎉 *ᴘᴇᴛ ᴅɪʙᴇʟɪ!*\n\n` +
            `╭┈┈⬡「 🐾 *ɴᴇᴡ ᴘᴇᴛ* 」\n` +
            `┃ 🏷️ Nombre: *${user.rpg.pet.name}*\n` +
            `┃ 🐾 Tipo: *${petToBuy.name}*\n` +
            `┃ 💰 Precio: *-${petToBuy.price.toLocaleString()}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Usa \`${m.prefix}pet\` para ver el estado de tu mascota!`
        )
    }
}

export { pluginConfig as config, handler }
