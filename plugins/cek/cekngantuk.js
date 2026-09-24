const pluginConfig = {
    name: 'cekngantuk',
    alias: ['ngantuk', 'sleepy'],
    category: 'cek',
    description: "Comprueba tus niveles de sueño.",
    usage: ".cekngantuk [@usuario]",
    example: '.cekngantuk Budi',
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
    if (percent >= 90) desc = "ZZZZZ... ¡Vete a dormir! 😴💤"
    else if (percent >= 70) desc = "Tiene los ojos medio cerrados~ 😪"
    else if (percent >= 50) desc = "Tiene un poco de sueño 🥱"
    else if (percent >= 30) desc = "¡Todavía fresco! ☕"
    else desc = "¡Muy despierto/a! ¿Insomnio? 👀"
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu nivel de sueño es del *${percent}%*.
\`\`\`${desc}\`\`\``
        : `Nivel de sueño de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
