const pluginConfig = {
    name: 'cekmalas',
    alias: ['malas', 'lazy'],
    category: 'cek',
    description: "Mira lo perezoso que eres.",
    usage: ".cekmalas [@usuario]",
    example: '.cekmalas Budi',
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
        desc = "¡SÚPER PEREZOSO/A! ¡Rey o reina del sofá! 🛏️"
    } else if (percent >= 70) {
        desc = "¡Muy perezoso/a! 😴"
    } else if (percent >= 50) {
        desc = "Bastante perezoso/a 🥱"
    } else if (percent >= 30) {
        desc = "Un poco perezoso/a 😊"
    } else {
        desc = "¡Muy trabajador/a! 💪"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de pereza es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de pereza de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
