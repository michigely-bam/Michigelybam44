const pluginConfig = {
    name: 'ceksetia',
    alias: ['setia', 'loyal'],
    category: 'cek',
    description: "Revisa tu nivel de lealtad.",
    usage: ".ceksetia [@usuario]",
    example: '.ceksetia Budi',
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
    if (percent >= 90) desc = "¡Cariño a muerte! 💍💕"
    else if (percent >= 70) desc = "¡Muy leal y sincero! ❤️"
    else if (percent >= 50) desc = "Bastante fiel~ 😊"
    else if (percent >= 30) desc = "Mmm... a veces duda 😅"
    else desc = '¿Modo rompecorazones? 😏'
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de fidelidad es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de fidelidad de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
