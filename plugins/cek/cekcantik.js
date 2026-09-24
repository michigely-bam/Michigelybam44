const pluginConfig = {
    name: 'cekcantik',
    alias: ['cantik', 'beautiful'],
    category: 'cek',
    description: "Mira lo bonita que eres.",
    usage: ".cekcantik [@usuario]",
    example: '.cekcantik Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = "¡Hermoso/a como un ángel! 👸✨"
    } else if (percent >= 70) {
        desc = "¡Muy hermoso/a! 💕"
    } else if (percent >= 50) {
        desc = "Dulce y bonita~ 🌸"
    } else if (percent >= 30) {
        desc = "Bastante hermoso/a 😊"
    } else {
        desc = "¡Sigue siendo hermoso/a! 💖"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de belleza es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de belleza de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
