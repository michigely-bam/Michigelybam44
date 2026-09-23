const pluginConfig = {
    name: 'cekrezeki',
    alias: ['rezeki', 'fortune'],
    category: 'cek',
    description: "Comprueba tu nivel de sustento hoy.",
    usage: ".cheque para el nombre identificado",
    example: '.cekrezeki Budi',
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
    if (percent >= 90) desc = 'Rezeki melimpah! Jackpot! 💰🎉'
    else if (percent >= 70) desc = "Rezeki está bien hoy.~ 💵"
    else if (percent >= 50) desc = 'Rezeki cukup, bersyukurlah 🙏'
    else if (percent >= 30) desc = 'Rezeki pas-pasan 😅'
    else desc = "Sé paciente, la comida vendrá~ 🫂"
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de residencia. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de residencia${mentioned.split('@')[0]} yak? 
    
Tingkat kerezekian dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }