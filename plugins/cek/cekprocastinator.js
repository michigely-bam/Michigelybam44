const pluginConfig = {
    name: 'cekprocastinator',
    alias: ['procrastinator', 'nunda'],
    category: 'cek',
    description: "Comprueba el nivel de procrastinación",
    usage: ".cekprocastinator [@usuario]",
    example: '.cekprocastinator Budi',
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
    if (percent >= 90) desc = "¿Fecha límite? Mejor mañana~ 😴"
    else if (percent >= 70) desc = '¡Maestro/a de la procrastinación! 🦥'
    else if (percent >= 50) desc = "A veces lo pospone y otras se esfuerza 😅"
    else if (percent >= 30) desc = "¡Bastante productivo/a! 💪"
    else desc = "¡Muy disciplinado/a! 🏆"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de procrastinación es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de procrastinación de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
