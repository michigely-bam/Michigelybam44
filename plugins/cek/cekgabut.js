const pluginConfig = {
    name: 'cekgabut',
    alias: ['gabut', 'bored'],
    category: 'cek',
    description: "Comprueba tu nivel de violencia.",
    usage: ".ccgabit Identificar nombre",
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
    if (percent >= 90) desc = 'GABUT LEVEL MAX! Main bot aja~ 🥱'
    else if (percent >= 70) desc = 'Gabut parah nih! 😴'
    else if (percent >= 50) desc = 'Lumayan gabut 😅'
    else if (percent >= 30) desc = 'Agak sibuk dikit 📝'
    else desc = 'Sibuk banget! Produktif! 💼'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de emoción. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de emoción @${mentioned.split('@')[0]} yak? 
    
Tingkat kegabutan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }