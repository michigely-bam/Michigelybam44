const pluginConfig = {
    name: 'ceksabar',
    alias: ['sabar', 'patience'],
    category: 'cek',
    description: "Comprueba tu nivel de paciencia.",
    usage: ".ejercicio < nombre >",
    example: '.ceksabar Budi',
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
    if (percent >= 90) desc = 'Sabar level dewa! Zen master~ 🧘'
    else if (percent >= 70) desc = 'Sangat sabar! Terpuji 👏'
    else if (percent >= 50) desc = 'Cukup sabar 😊'
    else if (percent >= 30) desc = 'Kadang emosian dikit 😅'
    else desc = 'Gampang marah nih... 😤'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de paciencia. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de paciencia @${mentioned.split('@')[0]} yak? 
    
Tingkat kesabaran dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }