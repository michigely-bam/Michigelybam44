const pluginConfig = {
    name: 'cekkece',
    alias: ['kece', 'cool'],
    category: 'cek',
    description: "Comprueba cuánto estilo tienes.",
    usage: ".cekkece [@usuario]",
    example: '.cekkece Budi',
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
        desc = "¡ESTILO IMPRESIONANTE! 😎🔥"
    } else if (percent >= 70) {
        desc = "¡Con muchísimo estilo! ✨"
    } else if (percent >= 50) {
        desc = "Bastante elegante~ 👍"
    } else if (percent >= 30) {
        desc = "Un poco elegante 😊"
    } else {
        desc = "¡Es normal, pero sigue siendo genial! 🙂"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de estilo es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de estilo de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
