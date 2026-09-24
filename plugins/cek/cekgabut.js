const pluginConfig = {
    name: 'cekgabut',
    alias: ['gabut', 'bored'],
    category: 'cek',
    description: "Comprueba tu nivel de aburrimiento.",
    usage: ".cekgabut [@usuario]",
    example: '.cekgabut Budi',
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
    if (percent >= 90) desc = "¡ABURRIMIENTO MÁXIMO! Mejor juega con el bot~ 🥱"
    else if (percent >= 70) desc = "¡Muy aburrido/a! 😴"
    else if (percent >= 50) desc = "Bastante aburrido/a 😅"
    else if (percent >= 30) desc = "Está un poco ocupado/a 📝"
    else desc = "¡Muy ocupado/a y productivo/a! 💼"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de aburrimiento es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de aburrimiento de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
