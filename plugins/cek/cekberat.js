const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: "Calcular un peso al azar",
    usage: ".cekberat [@usuario]",
    example: '.cekberat Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const berat = Math.floor(Math.random() * 60) + 40
    const mentioned = m.mentionedJid?.[0] || m.sender
    
    let desc = ''
    if (berat >= 90) {
        desc = '¡Una complexión fuerte! 💪'
    } else if (berat >= 70) {
        desc = "¡Te ves saludable! 😊"
    } else if (berat >= 55) {
        desc = "¡Peso ideal! 👍"
    } else if (berat >= 45) {
        desc = "Delgado/a~ 🌸"
    } else {
        desc = "Muy delgado/a; ¡come un poco más! 🍔"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu peso estimado es *${berat} kg*.
\`\`\`${desc}\`\`\``
        : `Peso estimado de @${mentioned.split('@')[0]}: *${berat} kg*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
