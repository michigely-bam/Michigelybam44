/**
 * Mimpi / Dream World - Fun dream interpretation generator
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'mimpi',
    alias: ['dream', 'dreamworld'],
    category: 'fun',
    description: "Explora el mundo de tus sueños por nombre",
    usage: ".mimpi <nombre>",
    example: '.mimpi Keisya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lucid ✨', 'Mystic 🌟', 'Ethereal 💫', 'Divine 🌙', 'Legendary 🎇']
const DREAM_QUALITIES = ['Peaceful 😌', 'Adventure 🚀', 'Mystical 🔮', 'Prophecy 📖', 'Epic 🗺️']

const ELEMENTS = [
    "🌊 Océano de cristal resplandeciente",
    "🌈 Arcoíris flotante",
    "🌺 Jardín flotante",
    "⭐ Constelación viviente",
    "🌙 Lunas gemelas",
    "🏰 Castillo de nubes",
    "🌋 Montaña prismática",
    "🎭 Teatro de sombras"
]

const EVENTS = [
    "🦋 Las tortugas llevan mensajes secretos",
    "🎭 Una máscara baila sola",
    "🌊 La lluvia de las estrellas cae al mar",
    "🎪 Desfile de criaturas mágicas",
    "🌺 Flores que cantan melodías antiguas",
    "🎨 Una pintura cobra vida",
    "🎵 La música se ve como un color",
    "⚡ Los relámpagos forman escaleras hacia el cielo"
]

const ENCOUNTERS = [
    "🐉 Dragón arcoíris sabio",
    "🧙‍♂️ Hechicero estelar",
    "🦊 Zorro espiritual de nueve colas",
    "🧝‍♀️ Hada portadora de sueños",
    "🦁 León de cristal",
    "🐋 Ballena voladora mística",
    "🦅 Tiempo Fénix",
    "🐢 Tortuga que carga el mundo",
    "🦄 Unicornio dimensional"
]

const POWERS = [
    "✨ Control de tiempo",
    "🌊 Hablando con Elemento",
    '🎭 Shapeshifting',
    "🌈 Manipulación de la realidad",
    "👁️ Visión del futuro",
    "🎪 Teletransportación dimensional",
    "🌙 Sanación espiritual",
    "⚡ Energía Kosmik"
]

const MESSAGES = [
    "Tu viaje traerá un gran cambio.",
    "Los antiguos secretos serán revelados en un futuro cercano",
    "Las fuerzas ocultas se levantarán pronto.",
    "El nuevo destino espera en el horizonte.",
    "Las conexiones espirituales serán fuertes",
    "Una transformación enorme está a punto de ocurrir.",
    "La iluminación vendrá de la dirección inesperada",
    "La misión importante comenzará pronto."
]

function generateDream(seed) {
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const pick = (arr) => arr[seedNum % arr.length]
    const pickMulti = (arr, count) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, count)
    }
    
    return {
        level: pick(DREAM_LEVELS),
        quality: pick(DREAM_QUALITIES),
        elements: pickMulti(ELEMENTS, 3),
        events: pickMulti(EVENTS, 2),
        encounters: pickMulti(ENCOUNTERS, 2),
        powers: pickMulti(POWERS, 2),
        message: pick(MESSAGES)
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    let name = args.join(' ') || m.pushName || m.sender.split('@')[0]
    
    await m.react('🌙')
    await m.reply("🌙 *Entrando al mundo de los sueños...*")
    await new Promise(r => setTimeout(r, 1500))
    
    const dream = generateDream(name)
    
    let txt = `╭═══❯ *🌙 DREAM WORLD* ❮═══\n`
    txt += `│ 👤 *Explorer:* ${name}\n`
    txt += `│ ⭐ *Level:* ${dream.level}\n`
    txt += `│ 💫 *Quality:* ${dream.quality}\n`
    txt += `│ 🌈 *Elements:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Events:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encounters:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Powers:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Message:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
