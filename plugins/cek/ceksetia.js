const pluginConfig = {
    name: 'ceksetia',
    alias: ['setia', 'loyal'],
    category: 'cek',
    description: "Revisa tu nivel de lealtad.",
    usage: ".lista de verificación de nombre",
    example: '.ceksetia Budi',
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
    if (percent >= 90) desc = "¡Cariño a muerte! 💍💕"
    else if (percent >= 70) desc = "¡Muy leal y sincero! ❤️"
    else if (percent >= 50) desc = 'Cukup setia~ 😊'
    else if (percent >= 30) desc = 'Hmm... kadang goyah 😅'
    else desc = 'Playboy/Playgirl mode? 😏'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de lealtad. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de lealtad @${mentioned.split('@')[0]} yak? 
    
Tingkat kesetiaan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }