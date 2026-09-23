const pluginConfig = {
    name: 'ceksocmed',
    alias: ['sosmed', 'medsos'],
    category: 'cek',
    description: 'Cek tingkat kecanduan sosmed',
    usage: ".cksocmed   nombre",
    example: '.ceksocmed Budi',
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
    if (percent >= 90) desc = 'Kecanduan parah! Detox needed! 📱💀'
    else if (percent >= 70) desc = 'Scroll terus tanpa henti~ 📲'
    else if (percent >= 50) desc = 'Normal usage 👍'
    else if (percent >= 30) desc = 'Cukup sehat nih 🌿'
    else desc = 'Digital detox master! 🧘'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
El nivel de tu sockfield *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de fútbol${mentioned.split('@')[0]} yak? 
    
Tingkat kesocmedan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }