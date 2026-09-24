const pluginConfig = {
    name: 'cekjahat',
    alias: ['jahat', 'evil'],
    category: 'cek',
    description: "Mira lo mal que estás.",
    usage: ".cekjahat [@usuario]",
    example: '.cekjahat Budi',
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
        desc = '¡NIVEL VILLANO! 😈👿'
    } else if (percent >= 70) {
        desc = "¡Muy malvado/a! 💀"
    } else if (percent >= 50) {
        desc = "Bastante travieso/a 😏"
    } else if (percent >= 30) {
        desc = "Un poco travieso/a 😊"
    } else {
        desc = "¡Está bien, no es malo! 😇"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de maldad es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de maldad de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
