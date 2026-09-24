const pluginConfig = {
    name: 'cekumur',
    alias: ['umur', 'age'],
    category: 'cek',
    description: "Revisa tu edad mental.",
    usage: ".cekumur [@usuario]",
    example: '.cekumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 80) + 5
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 60) desc = "¡Sabio/a como una persona mayor! 🧓"
    else if (percent >= 40) desc = "Maduro/a y responsable~ 🧑"
    else if (percent >= 20) desc = "¡Alma joven! 🧒"
    else desc = "Aún tienes alma de niño/a~ 👶"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu edad mental estimada es de *${percent} años*.
\`\`\`${desc}\`\`\``
        : `Edad mental estimada de @${mentioned.split('@')[0]}: *${percent} años*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
