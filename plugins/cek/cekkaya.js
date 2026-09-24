const pluginConfig = {
    name: 'cekkaya',
    alias: ['kaya', 'rich'],
    category: 'cek',
    description: "Mira lo rico que eres.",
    usage: ".cekkaya [@usuario]",
    example: '.cekkaya Budi',
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
    let emoji = ''
    if (percent >= 90) {
        desc = '¡Magnate! ¡Riqueza extrema! 💎'
        emoji = '👑'
    } else if (percent >= 70) {
        desc = "¡Riquísimo/a! 💰"
        emoji = '💎'
    } else if (percent >= 50) {
        desc = "Tiene una situación económica bastante buena 💵"
        emoji = '💰'
    } else if (percent >= 30) {
        desc = "Es suficiente para la vida. 😊"
        emoji = '💵'
    } else {
        desc = "¡Ánimo con el ahorro! 🙏"
        emoji = '🪙'
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de riqueza es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de riqueza de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
