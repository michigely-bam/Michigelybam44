const pluginConfig = {
    name: 'cekoverpower',
    alias: ['overpower', 'op'],
    category: 'cek',
    description: "Comprueba tu nivel de poder.",
    usage: ".cekoverpower [@usuario]",
    example: '.cekoverpower Budi',
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
    if (percent >= 90) desc = "¡PODER DESCOMUNAL! ¡LEYENDA! 👑🔥"
    else if (percent >= 70) desc = "¡Muy fuerte! 💪"
    else if (percent >= 50) desc = "Bastante fuerte~ 😎"
    else if (percent >= 30) desc = "Normalito/a 🤔"
    else desc = "Todavía necesita practicar 📝"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de poder es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de poder de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
