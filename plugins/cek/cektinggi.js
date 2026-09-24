const pluginConfig = {
    name: 'cektinggi',
    alias: ['tinggi', 'tall'],
    category: 'cek',
    description: "Calcular una altura al azar",
    usage: ".cektinggi [@usuario]",
    example: '.cektinggi Budi',
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

        const tinggi = Math.floor(Math.random() * 50) + 150
    
    let desc = ''
    if (tinggi >= 190) {
        desc = "¡MUY ALTO/A! Podrías jugar baloncesto 🏀"
    } else if (tinggi >= 175) {
        desc = "¡Altura ideal! 😎"
    } else if (tinggi >= 165) {
        desc = "Bastante alto/a 👍"
    } else if (tinggi >= 155) {
        desc = "Está dentro del promedio 🙂"
    } else {
        desc = "¡Qué lindo y pequeño! 🥺"
    }
    
    let txt = mentioned === m.sender
        ? `Hola @${mentioned.split('@')[0]}

Tu altura estimada es *${tinggi} cm*.
\`\`\`${desc}\`\`\``
        : `Altura estimada de @${mentioned.split('@')[0]}: *${tinggi} cm*.
\`\`\`${desc}\`\`\``
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
