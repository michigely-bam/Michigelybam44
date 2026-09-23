const pluginConfig = {
    name: 'cekintrovert',
    alias: ['introvert'],
    category: 'cek',
    description: "Comprueba los niveles de introvertido.",
    usage: ".cekintrovert   nombre >",
    example: '.cekintrovert Budi',
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
    if (percent >= 90) desc = 'Rumah adalah surga! Stay home~ 🏠'
    else if (percent >= 70) desc = 'Social battery terbatas 🔋'
    else if (percent >= 50) desc = 'Ambivert, balance~ ⚖️'
    else if (percent >= 30) desc = 'Cukup social butterfly 🦋'
    else desc = 'Extrovert mode ON! 🎉'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tus niveles introvertidos. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de introversión @${mentioned.split('@')[0]} yak? 
    
Tingkat keintrovertan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }