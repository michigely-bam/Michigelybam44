const pluginConfig = {
    name: 'cekkarma',
    alias: ['karma'],
    category: 'cek',
    description: "Revisa tus niveles de karma.",
    usage: ".ceckarma &gt; nombre &gt;",
    example: '.cekkarma Budi',
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
    if (percent >= 80) desc = 'Karma baik! Surga menantimu~ ✨'
    else if (percent >= 60) desc = 'Cukup baik, terus tingkatkan! 🙏'
    else if (percent >= 40) desc = 'Netral, perbanyak kebaikan~ ⚖️'
    else if (percent >= 20) desc = "Hati-hati ¡Con mal karma! ⚠️"
    else desc = 'Wah perlu banyak tobat nih... 😱'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de decencia *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de descuido @${mentioned.split('@')[0]} yak? 
    
Tingkat kekarmaan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }