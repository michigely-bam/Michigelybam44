/**
 * Alma gemela: comprobador divertido de compatibilidad
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'soulmatch',
    alias: [],
    category: 'fun',
    description: "Revisa un fósforo con alguien.",
    usage: ".soulmatch <nombre1> <nombre2>",
    example: ".soulmatch Raiden|Mayo",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const ELEMENTS = ['Api 🔥', 'Air 💧', "Tierra 🌍", "Viento 🌪️", "Rayo ⚡", 'Es ❄️', "Luz ✨", "Sombra 🌑"]
const ZODIAC = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo',
               '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces']
const SOUL_TYPES = [
    "Un líder valiente", "Equilibrio sabio", "Creador expresivo", "Constructor sólido",
    "Aventurero libre", "Protector fiel", "Pensador místico", "Conquistador fuerte", "Humanitario puro"
]

function generateSoulData(name, seed) {
    const nameVal = Array.from(name.toLowerCase()).reduce((a, c) => a + c.charCodeAt(0), 0)
    return {
        element: ELEMENTS[(nameVal + seed) % ELEMENTS.length],
        zodiac: ZODIAC[(nameVal + seed * 2) % ZODIAC.length],
        soulType: SOUL_TYPES[(nameVal + seed * 3) % SOUL_TYPES.length]
    }
}

function getMatchDescription(score) {
    if (score >= 90) return "💫 Destino verdadero"
    if (score >= 80) return "✨ Armonía perfecta"
    if (score >= 70) return "🌟 Conexión fuerte"
    if (score >= 60) return "⭐ Buen potencial"
    if (score >= 50) return "🌙 Requiere esfuerzo"
    return "🌑 Desafío difícil"
}

function getReading(score) {
    if (score >= 80) {
        return "Tus almas tienen una conexión muy especial y rara."
    } else if (score >= 60) {
        return "Hay una poderosa química entre ustedes, y sus diferencias crean armonía."
    } else if (score >= 40) {
        return "Se necesita tiempo para entenderse, cada desafío para fortalecer su vínculo."
    }
    return "Una diferencia significativa en la energía del alma requiere mucha adaptación y comprensión."
}

async function handler(m, { sock }) {
    const args = m.args || []
    const text = args.join(' ')

    if (!text || !text.includes('|')) {
        return m.reply(
            `💫 *sᴏᴜʟ ᴍᴀᴛᴄʜ*\n\n` +
            `> ¡Comprueba la compatibilidad de dos almas!

` +
            `*Formato:*\n` +
            `> \`.soulmatch nama1|nama2\`\n\n` +
            `*Ejemplo:*
` +
            `> \`.soulmatch Raiden|Mayo\``
        )
    }

    const [nama1, nama2] = text.split('|').map(n => n.trim())

    if (!nama1 || !nama2) {
        return m.reply(`❌ Introduzca 2 nombres en formato: \`${m.prefix}nombre del alma gemela 1.\``)
    }

    await m.react('🕕')

    const seed1 = Date.now() % 100
    const seed2 = (Date.now() + 50) % 100
    const soul1 = generateSoulData(nama1, seed1)
    const soul2 = generateSoulData(nama2, seed2)
    const combined = nama1.toLowerCase() + nama2.toLowerCase()
    const baseScore = Array.from(combined).reduce((a, c) => a + c.charCodeAt(0), 0)
    const compatibility = (baseScore % 51) + 50
    let txt = `╭═══❯ *💫 SOUL MATCH* ❮═══\n`
    txt += `│\n`
    txt += `│ 👤 *${nama1}*\n`
    txt += `│ ├ 🔮 Soul: ${soul1.soulType}\n`
    txt += `│ ├ 🌟 Element: ${soul1.element}\n`
    txt += `│ └ 🎯 Zodiac: ${soul1.zodiac}\n`
    txt += `│\n`
    txt += `│ 👤 *${nama2}*\n`
    txt += `│ ├ 🔮 Soul: ${soul2.soulType}\n`
    txt += `│ ├ 🌟 Element: ${soul2.element}\n`
    txt += `│ └ 🎯 Zodiac: ${soul2.zodiac}\n`
    txt += `│\n`
    txt += `│ 💕 *COMPATIBILITY*\n`
    txt += `│ ├ 📊 Score: *${compatibility}%*\n`
    txt += `│ └ 🎭 Status: ${getMatchDescription(compatibility)}\n`
    txt += `│\n`
    txt += `│ 🔮 *Reading:*\n`
    txt += `│ ${getReading(compatibility)}\n`
    txt += `│\n`
    txt += `╰════════════════════`
    await m.reply(txt)
    m.react('✅')
}

export { pluginConfig as config, handler }
