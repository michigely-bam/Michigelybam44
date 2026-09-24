const pluginConfig = {
    name: 'cekgacha',
    alias: ['gacha', 'luck'],
    category: 'cek',
    description: "Comprueba tu suerte en el gacha",
    usage: '.cekgacha [@usuario]',
    example: '.cekgacha Budi',
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
    if (percent >= 90) desc = "¡SUERTE EXTREMA! ¡SSR GARANTIZADO! ✨💎"
    else if (percent >= 70) desc = "¡Qué suerte! Seguro obtienes un SR o superior 🍀"
    else if (percent >= 50) desc = 'Un poco de suerte 😊'
    else if (percent >= 30) desc = 'Mmm... ¡pide un poco más de suerte! 🙏'
    else desc = "¡MALA SUERTE! Mejor prueba el gacha más tarde 💔"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de suerte en el gacha es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de suerte en el gacha de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
