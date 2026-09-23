const pluginConfig = {
    name: 'cekumur',
    alias: ['umur', 'age'],
    category: 'cek',
    description: "Revisa tu edad mental.",
    usage: ".cluck   nombre",
    example: '.cekumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 80) + 5
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 60) desc = 'Bijaksana seperti orang tua! 🧓'
    else if (percent >= 40) desc = "Adulto y maduración~ 🧑"
    else if (percent >= 20) desc = 'Jiwa muda! 🧒'
    else desc = "Aún como un niño.~ 👶"
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de nacimiento. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel general @${mentioned.split('@')[0]} yak? 
    
Tingkat keumuran dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }