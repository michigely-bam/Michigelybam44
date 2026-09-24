const pluginConfig = {
    name: 'cekkarma',
    alias: ['karma'],
    category: 'cek',
    description: "Revisa tus niveles de karma.",
    usage: '.cekkarma [@usuario]',
    example: '.cekkarma Budi',
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
    if (percent >= 80) desc = "¡Buen karma! El cielo te espera~ ✨"
    else if (percent >= 60) desc = "¡Muy bien, sigue mejorando! 🙏"
    else if (percent >= 40) desc = 'Neutral, haz más buenas acciones~ ⚖️'
    else if (percent >= 20) desc = "¡Cuidado con el mal karma! ⚠️"
    else desc = "Ah, necesita mucho arrepentimiento... 😱"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de karma es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de karma de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
