const pluginConfig = {
    name: 'cekyandere',
    alias: ['yandere'],
    category: 'cek',
    description: "Comprueba tus niveles de yandere.",
    usage: ".checkyandere",
    example: '.cekyandere Budi',
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
    if (percent >= 90) desc = "Eres mía para siempre.~ 🔪💕"
    else if (percent >= 70) desc = "No te acerques a él. 👁️"
    else if (percent >= 50) desc = 'Overprotective sedikit~ 🫂'
    else if (percent >= 30) desc = 'Agak posesif 😅'
    else desc = 'Normal kok, santai~ 😊'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel keyanderean *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel keyanderean @${mentioned.split('@')[0]} yak? 
    
Tingkat keyanderean dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }