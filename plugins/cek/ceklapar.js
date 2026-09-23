const pluginConfig = {
    name: 'ceklapar',
    alias: ['lapar', 'hungry'],
    category: 'cek',
    description: "Comprueba tu nivel de hambre.",
    usage: ".checkhungry - Nombre",
    example: '.ceklapar Budi',
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
    if (percent >= 90) desc = 'LAPARRR! Makan sekarang! 🍔🍕🍜'
    else if (percent >= 70) desc = 'Perut keroncongan~ 😋'
    else if (percent >= 50) desc = "¿Puedes comer? 🍿"
    else if (percent >= 30) desc = "Todavía está lleno 😊"
    else desc = 'Kekenyangan! 🤰'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de hambre *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de hambre @${mentioned.split('@')[0]} yak? 
    
Tingkat kelaparan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }