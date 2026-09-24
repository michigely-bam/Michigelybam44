const pluginConfig = {
    name: 'cekyandere',
    alias: ['yandere'],
    category: 'cek',
    description: "Comprueba tu nivel de yandere.",
    usage: ".cekyandere [@usuario]",
    example: '.cekyandere Budi',
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
    if (percent >= 90) desc = "Eres mía para siempre.~ 🔪💕"
    else if (percent >= 70) desc = "No te acerques a él. 👁️"
    else if (percent >= 50) desc = "Un poco sobreprotector/a~ 🫂"
    else if (percent >= 30) desc = "Es algo posesivo/a 😅"
    else desc = "Es normal, relájate~ 😊"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de yandere es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de yandere de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
