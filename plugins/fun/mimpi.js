/**
 * Mimpi / Dream World - Fun dream interpretation generator
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'mimpi',
    alias: ['dream', 'dreamworld'],
    category: 'fun',
    description: "Explora el mundo de tus sueños por nombre",
    usage: ".sueño  dream nombre >",
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
    '🌊 Lautan Kristal Bercahaya',
    '🌈 Pelangi Mengambang',
    '🌺 Taman Melayang',
    '⭐ Konstelasi Hidup',
    '🌙 Bulan Kembar',
    '🏰 Kastil Awan',
    '🌋 Gunung Prisma',
    '🎭 Theater Bayangan'
]

const EVENTS = [
    '🦋 Kupu-kupu membawa pesan rahasia',
    '🎭 Topeng menari sendiri',
    '🌊 Hujan bintang jatuh ke laut',
    '🎪 Parade makhluk ajaib',
    '🌺 Bunga bernyanyi lagu kuno',
    '🎨 Lukisan menjadi hidup',
    '🎵 Musik terlihat sebagai warna',
    '⚡ Petir membentuk tangga ke langit'
]

const ENCOUNTERS = [
    '🐉 Naga Pelangi Bijaksana',
    '🧙‍♂️ Penyihir Bintang',
    '🦊 Rubah Spirit Sembilan Ekor',
    '🧝‍♀️ Peri Pembawa Mimpi',
    '🦁 Singa Kristal',
    '🐋 Paus Terbang Mistis',
    "🦅 Tiempo Fénix",
    '🐢 Kura-kura Pembawa Dunia',
    '🦄 Unicorn Dimensi'
]

const POWERS = [
    "✨ Control de tiempo",
    "🌊 Hablando con Elemento",
    '🎭 Shapeshifting',
    '🌈 Manipulasi Realitas',
    '👁️ Penglihatan Masa Depan',
    '🎪 Teleportasi Dimensi',
    '🌙 Penyembuhan Spiritual',
    '⚡ Energi Kosmik'
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
    await m.reply('🌙 *Memasuki alam mimpi...*')
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