const pluginConfig = {
    name: 'cekprocastinator',
    alias: ['procrastinator', 'nunda'],
    category: 'cek',
    description: 'Cek tingkat suka menunda',
    usage: ".ckprocinstator",
    example: '.cekprocastinator Budi',
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
    if (percent >= 90) desc = 'Deadline? Besok aja deh~ 😴'
    else if (percent >= 70) desc = 'Master procrastination! 🦥'
    else if (percent >= 50) desc = 'Kadang nunda, kadang rajin 😅'
    else if (percent >= 30) desc = 'Cukup produktif! 💪'
    else desc = 'Disiplin tinggi! Salut! 🏆'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de procinstinación. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de procinstinatorship @${mentioned.split('@')[0]} yak? 
    
Tingkat keprocastinatoran dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }