const pluginConfig = {
    name: 'cekpsikopat',
    alias: ['psikopat', 'psycho'],
    category: 'cek',
    description: "Mira lo psicópata que eres.",
    usage: ".cecpsychopath - Nombre",
    example: '.cekpsikopat Budi',
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
    if (percent >= 90) {
        desc = 'PSIKOPAT AKUT! Jauhi! 😈'
    } else if (percent >= 70) {
        desc = "Hati-hati Con este tipo. 👀"
    } else if (percent >= 50) {
        desc = 'Ada sisi gelapnya 🌑'
    } else if (percent >= 30) {
        desc = 'Sedikit misterius 🤔'
    } else {
        desc = "Normal y amable 😇"
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de psicosis. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de psico @${mentioned.split('@')[0]} yak? 
    
Tingkat kepsikopatan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }