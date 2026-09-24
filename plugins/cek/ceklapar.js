const pluginConfig = {
    name: 'ceklapar',
    alias: ['lapar', 'hungry'],
    category: 'cek',
    description: "Comprueba tu nivel de hambre.",
    usage: ".ceklapar [@usuario]",
    example: '.ceklapar Budi',
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
    if (percent >= 90) desc = "¡HAMBRE MÁXIMA! ¡Come ahora! 🍔🍕🍜"
    else if (percent >= 70) desc = "¡El estómago ruge! 😋"
    else if (percent >= 50) desc = "Ya toca comer algo 🍿"
    else if (percent >= 30) desc = "Apenas tienes hambre 😊"
    else desc = "¡Llenísimo/a! 🤰"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de hambre es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de hambre de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
