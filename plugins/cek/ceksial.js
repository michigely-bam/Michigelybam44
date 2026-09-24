const pluginConfig = {
    name: 'ceksial',
    alias: ['sial', 'apes'],
    category: 'cek',
    description: "Mira lo desafortunado que eres.",
    usage: ".ceksial [@usuario]",
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
        desc = "¡MUY MALA SUERTE! Mejor quédate en casa 😭"
    } else if (percent >= 70) {
        desc = "¡La mala suerte te persigue! 😢"
    } else if (percent >= 50) {
        desc = "Bastante mala suerte 😓"
    } else if (percent >= 30) {
        desc = "Un poco desafortunado/a 😕"
    } else {
        desc = "¡No tienes mala suerte; tienes fortuna! 🍀"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de mala suerte es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de mala suerte de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
