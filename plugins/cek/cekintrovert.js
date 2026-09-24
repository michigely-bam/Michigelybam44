const pluginConfig = {
    name: 'cekintrovert',
    alias: ['introvert'],
    category: 'cek',
    description: "Comprueba los niveles de introvertido.",
    usage: ".cekintrovert   nombre >",
    example: '.cekintrovert Budi',
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
    if (percent >= 90) desc = "¡El hogar es el paraíso! Quédate en casa~ 🏠"
    else if (percent >= 70) desc = "Batería social limitada 🔋"
    else if (percent >= 50) desc = 'Ambivertido/a y equilibrado/a~ ⚖️'
    else if (percent >= 30) desc = "Es bastante sociable 🦋"
    else desc = '¡Modo extrovertido activado! 🎉'
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de introversión es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de introversión de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
