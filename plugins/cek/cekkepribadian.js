const pluginConfig = {
    name: 'cekkepribadian',
    alias: ['kepribadian', 'personality'],
    category: 'cek',
    description: "Verifica tu personalidad",
    usage: ".% s",
    example: '.cekkepribadian Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const personalities = [
    { type: 'INTJ', title: 'The Architect', desc: "Visionarios, estratégicos e independientes" },
    { type: 'INTP', title: 'The Logician', desc: "Analista, innovador, curioso" },
    { type: 'ENTJ', title: 'The Commander', desc: "líderes firmes, ambiciosos y naturales" },
    { type: 'ENTP', title: 'The Debater', desc: "Inteligente, curioso y ama los desafíos" },
    { type: 'INFJ', title: 'The Advocate', desc: "Idolistas, sabias y empáticas" },
    { type: 'INFP', title: 'The Mediator', desc: "Creativo, idealista, leal" },
    { type: 'ENFJ', title: 'The Protagonist', desc: "Carismático, inspirador, cariñoso" },
    { type: 'ENFP', title: 'The Campaigner', desc: "Antusias, creativas y sociales" },
    { type: 'ISTJ', title: 'The Logistician', desc: "Responsable, práctico y meticuloso" },
    { type: 'ISFJ', title: 'The Defender', desc: "Préstamo, apoyo y religión" },
    { type: 'ESTJ', title: 'The Executive', desc: "Organizado, firme y tradicional" },
    { type: 'ESFJ', title: 'The Consul', desc: "Caring, social, y leal" },
    { type: 'ISTP', title: 'The Virtuoso', desc: "Flexible, observatorio y práctico" },
    { type: 'ISFP', title: 'The Adventurer', desc: "Artístico, sensible, espontáneo" },
    { type: 'ESTP', title: 'The Entrepreneur', desc: "Energética, perceptiva y valiente" },
    { type: 'ESFP', title: 'The Entertainer', desc: "Espontáneo, energético y divertido" }
]

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const p = personalities[Math.floor(Math.random() * personalities.length)]
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tu nivel de personalidad *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\`` : `Usted quiere comprobar la personalidad @${mentioned.split('@')[0]} yak? 
    
Kepribadian dia adalah *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }