const pluginConfig = {
    name: 'cekbucin',
    alias: ['bucin'],
    category: 'cek',
    description: "Comprueba qué tan enamoradizo eres.",
    usage: ".cekbucin [@usuario]",
    example: '.cekbucin Budi',
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
        desc = "¡ENAMORAMIENTO EXTREMO! Ya no tiene remedio 😭💔"
    } else if (percent >= 70) {
        desc = "Muy enamoradizo/a~ 🥺"
    } else if (percent >= 50) {
        desc = "Bastante enamoradizo/a 💕"
    } else if (percent >= 30) {
        desc = "Un poco enamoradizo/a 😊"
    } else {
        desc = "Relajado/a, nada enamoradizo/a 😎"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de enamoramiento es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de enamoramiento de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
