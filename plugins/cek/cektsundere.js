const pluginConfig = {
    name: 'cektsundere',
    alias: ['tsundere'],
    category: 'cek',
    description: "Comprueba tus niveles de Tsundere",
    usage: ".cktsundere = nombre",
    example: '.cektsundere Budi',
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
    if (percent >= 90) desc = "¡No puede significar que me gustes! 😤💢"
    else if (percent >= 70) desc = "¡No me malinterpretes! 😳"
    else if (percent >= 50) desc = "Y-yah Depende de ti. 👉👈"
    else if (percent >= 30) desc = 'Agak tsundere dikit~ 😊'
    else desc = "No estudiar, honestamente 💕"
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de dexterean *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de la quidiidad @${mentioned.split('@')[0]} yak? 
    
Tingkat ketsunderean dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }