const pluginConfig = {
    name: 'cekbaik',
    alias: ['baik', 'kind'],
    category: 'cek',
    description: "Mira lo bueno que eres.",
    usage: ".checkgood   nombre",
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
        desc = "¡Eres el hombre más amable del mundo! 😇✨"
    } else if (percent >= 70) {
        desc = "¡Bien y no arrogante! 💝"
    } else if (percent >= 50) {
        desc = 'Lumayan baik 😊'
    } else if (percent >= 30) {
        desc = 'Sedikit baik 🙂'
    } else {
        desc = 'Hmm, perlu introspeksi ?? 🤔'
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de bondad *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de bondad @${mentioned.split('@')[0]} yak? 
    
Tingkat kebaikan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }