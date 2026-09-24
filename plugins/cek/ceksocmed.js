const pluginConfig = {
    name: 'ceksocmed',
    alias: ['sosmed', 'medsos'],
    category: 'cek',
    description: "Comprueba el nivel de adicción a las redes sociales",
    usage: ".ceksocmed [@usuario]",
    example: '.ceksocmed Budi',
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
    if (percent >= 90) desc = "¡Adicción extrema! Necesita desintoxicación digital 📱💀"
    else if (percent >= 70) desc = "Desplázate sin parar~ 📲"
    else if (percent >= 50) desc = 'Uso normal 👍'
    else if (percent >= 30) desc = "Bastante saludable 🌿"
    else desc = '¡Maestro/a de la desintoxicación digital! 🧘'
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de uso de redes sociales es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de uso de redes sociales de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
