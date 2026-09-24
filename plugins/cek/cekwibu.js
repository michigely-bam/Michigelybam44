const pluginConfig = {
    name: 'cekwibu',
    alias: ['wibu', 'weeb'],
    category: 'cek',
    description: "Comprueba qué tan otaku eres.",
    usage: ".cekwibu [@usuario]",
    example: '.cekwibu Budi',
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
    if (percent >= 90) {
        desc = "¡OTAKU DE VERDAD! Ara ara~ 🎌"
    } else if (percent >= 70) {
        desc = "¡Otaku extremo/a! Kimochi~ 😍"
    } else if (percent >= 50) {
        desc = "Bastante otaku 🌸"
    } else if (percent >= 30) {
        desc = "Un poco otaku 😊"
    } else {
        desc = "Nada otaku; completamente normal 😎"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de afición otaku es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de afición otaku de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
