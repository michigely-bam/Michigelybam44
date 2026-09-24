const pluginConfig = {
    name: 'cekjodoh',
    alias: ['jodoh', 'match'],
    category: 'cek',
    description: "Comprueba la compatibilidad amorosa",
    usage: ".cekjodoh [@usuario]",
    example: '.cekjodoh Budi & Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const input = m.text?.trim() || ''
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)
    
    if (parts.length < 2) {
        return m.reply(`💕 *COMPATIBILIDAD AMOROSA*

> ¡Pon dos nombres!

> Ejemplo: ${m.prefix}cekjodoh Budi & Ani`)
    }
    
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = "¡Casarse inmediatamente! 💍"
    } else if (percent >= 70) {
        desc = "¡Muy compatibles! 💕"
    } else if (percent >= 50) {
        desc = "Bastante compatibles~ 😊"
    } else if (percent >= 30) {
        desc = "Hmm, hace falta más esfuerzo 🤔"
    } else {
        desc = "¿Quizás encuentre a alguien más? 😅"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de compatibilidad amorosa es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de compatibilidad amorosa de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
