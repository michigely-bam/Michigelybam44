const pluginConfig = {
    name: 'cekganteng',
    alias: ['ganteng', 'handsome'],
    category: 'cek',
    description: "Mira lo guapo que eres.",
    usage: ".cekganteng [@usuario]",
    example: '.cekganteng Budi',
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
        desc = "¡Atractivo al máximo! 😍🔥"
    } else if (percent >= 70) {
        desc = "¡Muy atractivo/a! 😎"
    } else if (percent >= 50) {
        desc = "Bastante atractivo/a~ 👍"
    } else if (percent >= 30) {
        desc = "Normalito/a 😅"
    } else {
        desc = "¿Quizá tenga belleza interior? 🤭"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de atractivo es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de atractivo de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
