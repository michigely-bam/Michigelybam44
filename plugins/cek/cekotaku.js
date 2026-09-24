const pluginConfig = {
    name: 'cekotaku',
    alias: ['otaku'],
    category: 'cek',
    description: "Comprueba tu nivel de afición al anime.",
    usage: ".cekotaku [@usuario]",
    example: '.cekotaku Budi',
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
    if (percent >= 90) desc = "¡SUGOI! ¡Otaku de verdad! 🎌✨"
    else if (percent >= 70) desc = "Nivel de otaku alto~ 🇯🇵"
    else if (percent >= 50) desc = 'Aficionado/a ocasional al anime 📺'
    else if (percent >= 30) desc = "Conoce un poco de anime 🤔"
    else desc = '¡Casi nada de anime! 😂'
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de afición al anime es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de afición al anime de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
