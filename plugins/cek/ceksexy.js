const pluginConfig = {
    name: 'ceksexy',
    alias: ['sexy', 'hot'],
    category: 'cek',
    description: "Mira lo sexy que eres.",
    usage: ".ceksexy Identificar nombre",
    example: '.ceksexy Budi',
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
        desc = 'SEXY ABIS! 🔥🔥🔥'
    } else if (percent >= 70) {
        desc = 'Hot banget! 😏'
    } else if (percent >= 50) {
        desc = 'Lumayan menggoda~ 😊'
    } else if (percent >= 30) {
        desc = 'Biasa aja sih 🙂'
    } else {
        desc = "Tal vez lindo no es sexy. 😅"
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de sexo. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de sexiness @${mentioned.split('@')[0]} yak? 
    
Tingkat kesexyan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }