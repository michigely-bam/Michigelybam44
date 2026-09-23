const pluginConfig = {
    name: 'cekcupu',
    alias: ['cupu', 'noob'],
    category: 'cek',
    description: "Revisa tu nivel de beso",
    usage: ".ckcupu − Nombre",
    example: '.cekcupu Budi',
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
    if (percent >= 90) desc = 'CUPU PARAH! NOOB DETECTED! 🤡'
    else if (percent >= 70) desc = "Aún no es nuevo.~ 😅"
    else if (percent >= 50) desc = 'Biasa aja lah 🤔'
    else if (percent >= 30) desc = 'Cukup jago! 💪'
    else desc = 'PRO PLAYER! GG! 🏆'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de beso *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de beso @${mentioned.split('@')[0]} yak? 
    
Tingkat kecupuan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }