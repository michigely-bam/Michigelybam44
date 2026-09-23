const pluginConfig = {
    name: 'ceksial',
    alias: ['sial', 'apes'],
    category: 'cek',
    description: "Mira lo desafortunado que eres.",
    usage: ".cckal < nombre",
    example: '.ceksial Budi',
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
        desc = 'SIAL BANGET! Mending di rumah aja! 😭'
    } else if (percent >= 70) {
        desc = "Estoy muy caliente.~ 😢"
    } else if (percent >= 50) {
        desc = 'Lumayan sial 😓'
    } else if (percent >= 30) {
        desc = 'Sedikit sial 😕'
    } else {
        desc = 'Gak sial, hoki dong! 🍀'
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de mala suerte. *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar los niveles desafortunados @${mentioned.split('@')[0]} yak? 
    
Tingkat kesialan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }