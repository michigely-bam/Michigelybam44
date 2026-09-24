const pluginConfig = {
    name: 'cektsundere',
    alias: ['tsundere'],
    category: 'cek',
    description: "Comprueba tu nivel de tsundere",
    usage: ".cektsundere [@usuario]",
    example: '.cektsundere Budi',
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
    if (percent >= 90) desc = "¡No puede significar que me gustes! 😤💢"
    else if (percent >= 70) desc = "¡No me malinterpretes! 😳"
    else if (percent >= 50) desc = "B-bueno... depende de ti 👉👈"
    else if (percent >= 30) desc = "Es un poco tsundere~ 😊"
    else desc = "Nada de tsundere; eres muy sincero/a 💕"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de tsundere es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de tsundere de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
