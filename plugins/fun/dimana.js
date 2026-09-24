const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: "Pregúntale al bot dónde está algo",
    usage: '.dimana <pregunta>',
    example: ".dimana ¿dónde está mi alma gemela?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Cerca de ti!',
    "Muy lejos.",
    "En un lugar que no esperabas.",
    'En tu corazón.',
    "Por aquí cerca.",
    "Prueba la habitación.",
    "Allá afuera, esperándote.",
    "En el mismo lugar que tú.",
    "En algún lugar hermoso.",
    "Detrás de la puerta.",
    'A tu izquierda.',
    "¡Frente a tus ojos!",
    "Muy lejos, ¿quizá en el extranjero?",
    "En un lugar de recuerdos.",
    '¡En todas partes!',
    'En el mundo virtual.',
    'En el mundo de los sueños.',
    "En un lugar secreto.",
    "Mmm, su ubicación es difícil de explicar.",
    "En un lugar que te hará feliz."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*

> ¡Haz una pregunta!

*Ejemplo:*
> .dimana ¿dónde está mi alma gemela?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
