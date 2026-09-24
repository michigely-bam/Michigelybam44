const pluginConfig = {
    name: 'ceksisaumur',
    alias: ['sisaumur', 'umur'],
    category: 'cek',
    description: "Mira el resto de tu vida.",
    usage: ".ceksisaumur [@usuario]",
    example: '.ceksisaumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        
    const mentioned = m.mentionedJid[0] || m.sender

        
    const tahun = Math.floor(Math.random() * 80) + 20
    const bulan = Math.floor(Math.random() * 12)
    const hari = Math.floor(Math.random() * 30)
    
    let desc = ''
    if (tahun > 80) {
        desc = "¡Qué larga vida! 🎉"
    } else if (tahun > 60) {
        desc = "Bastante larga~ ✨"
    } else if (tahun > 40) {
        desc = "Ya es suficiente 😊"
    } else {
        desc = "¡Cuida tu salud! 🙏"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu tiempo de vida restante estimado es de *${tahun} años, ${bulan} meses y ${hari} días*.
\`\`\`${desc}\`\`\``
        : `Tiempo de vida restante estimado de @${mentioned.split('@')[0]}: *${tahun} años, ${bulan} meses y ${hari} días*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
