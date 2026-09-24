const pluginConfig = {
    name: 'cekgamer',
    alias: ['gamer', 'pro'],
    category: 'cek',
    description: "Comprueba qué tan gamer eres.",
    usage: ".cekgamer < nombre",
    example: '.cekgamer Budi',
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
        desc = "¡JUGADOR PROFESIONAL! ¡Nivel eSports! 🏆"
    } else if (percent >= 70) {
        desc = "¡Juega muy bien! 🎮"
    } else if (percent >= 50) {
        desc = "Bastante profesional 👍"
    } else if (percent >= 30) {
        desc = "Aún estás practicando 😅"
    } else {
        desc = "Mejor juega a cocinar 🍳"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de gamer es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de gamer de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
