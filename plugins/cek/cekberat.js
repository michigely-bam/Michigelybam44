const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: 'Cek berat badan random',
    usage: ".checkweight < nombre",
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
        desc = 'Big boy/girl! 💪'
    } else if (berat >= 70) {
        desc = "¡Limpiada y sana! 😊"
    } else if (berat >= 55) {
        desc = 'Ideal banget! 👍'
    } else if (berat >= 45) {
        desc = 'Langsing nih~ 🌸'
    } else {
        desc = "¡Es tan delgado, come tanto! 🍔"
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu peso. *${berat} kg*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el peso @${mentioned.split('@')[0]} yak? 
    
Berat badan dia sebesar *${berat} kg*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
