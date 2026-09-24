const pluginConfig = {
    name: 'cekkpopers',
    alias: ['kpopers', 'kpop'],
    category: 'cek',
    description: "Comprueba su nivel de fan de K-pop",
    usage: ".cekkpopers [@usuario]",
    example: '.cekkpopers Budi',
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
    if (percent >= 90) desc = "¡Nivel ARMY/BLINK máximo! 💜💗"
    else if (percent >= 70) desc = "¡Fan incondicional! 🎤"
    else if (percent >= 50) desc = 'Oyente ocasional~ 🎵'
    else if (percent >= 30) desc = "Solo conoce algunas cosas 😅"
    else desc = "No es fan de K-pop 🤷"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de afición al K-pop es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de afición al K-pop de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
