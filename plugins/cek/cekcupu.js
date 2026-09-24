const pluginConfig = {
    name: 'cekcupu',
    alias: ['cupu', 'noob'],
    category: 'cek',
    description: "Comprueba tu nivel de novato",
    usage: ".cekcupu [@usuario]",
    example: '.cekcupu Budi',
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
    if (percent >= 90) desc = "¡NOVATO TOTAL! 🤡"
    else if (percent >= 70) desc = "Muy novato/a todavía~ 😅"
    else if (percent >= 50) desc = "Es normal, nada especial 🤔"
    else if (percent >= 30) desc = "¡Bastante hábil! 💪"
    else desc = '¡JUGADOR PROFESIONAL! ¡GG! 🏆'
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de novato es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de novato de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
