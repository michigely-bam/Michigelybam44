const pluginConfig = {
    name: 'cekbaik',
    alias: ['baik', 'kind'],
    category: 'cek',
    description: "Mira lo bueno que eres.",
    usage: ".cekbaik [@usuario]",
    example: '.cekbaik Budi',
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
        desc = "¡Eres la persona más amable del mundo! 😇✨"
    } else if (percent >= 70) {
        desc = "¡Bien y no arrogante! 💝"
    } else if (percent >= 50) {
        desc = "Bastante bueno/a 😊"
    } else if (percent >= 30) {
        desc = "Un poco bueno 🙂"
    } else {
        desc = "Mmm, quizá necesite reflexionar 🤔 🤔"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de bondad es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de bondad de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
