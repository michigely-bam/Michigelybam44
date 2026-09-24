const pluginConfig = {
    name: 'cekjomblo',
    alias: ['jomblo', 'single'],
    category: 'cek',
    description: "Comprueba tu nivel de soltería.",
    usage: ".cekjomblo [@usuario]",
    example: '.cekjomblo Budi',
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
    if (percent >= 90) desc = "¡Soltero/a para siempre! La soltería es felicidad~ 💔😎"
    else if (percent >= 70) desc = '¡Persona fuerte e independiente! 💪'
    else if (percent >= 50) desc = 'Aún estás conociendo a alguien 😍'
    else if (percent >= 30) desc = "Alguien está enamorado de él.~ 👀"
    else desc = '¡Pronto dejarás la soltería! 💕'
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de soltería es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de soltería de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
