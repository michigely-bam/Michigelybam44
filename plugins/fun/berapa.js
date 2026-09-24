const pluginConfig = {
    name: 'berapa',
    alias: ['howmuch', 'howmany'],
    category: 'fun',
    description: "Pregúntale al bot cuánto vale algo",
    usage: '.berapa <pregunta>',
    example: ".berapa ¿qué edad tiene mi alma gemela?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '1',
    '7',
    '12',
    '21',
    '99',
    '69',
    '100',
    '50',
    '25',
    '1000',
    '5',
    '17',
    '88',
    '33',
    "nada (la respuesta siempre es «nada»)",
    "¡Muchísimo!",
    "Solo un poco.",
    "¡Incontable!",
    "Mmm, alrededor de 10.",
    "¡Más de lo que piensas!",
    "No sé, me da pereza"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔢 *CUÁNTO*

> ¡Haz una pregunta!

*Ejemplo:*
> .berapa ¿qué edad tiene mi alma gemela?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
