const pluginConfig = {
    name: 'apakah',
    alias: ['apa'],
    category: 'fun',
    description: "Pregúntale al bot si algo es cierto",
    usage: '.apakah <pregunta>',
    example: ".¿Puedo ser rico?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "¡Sí, por supuesto!",
    "No, no lo creo.",
    "Tal vez, intente de nuevo más tarde.",
    "Mmm... creo que sí.",
    "Lo dudo, pero podría ser.",
    "¡Seguro! ¡100 %!",
    "De ninguna manera.",
    "Podría ser, ¿quién sabe?",
    "Creo que sí.",
    "Vaya, parece que no.",
    "Claro, ¿por qué no?",
    "No lo sé, pregúntame otra cosa.",
    "¡Claro que sí!",
    "No lo creo.",
    "¡Estoy seguro/a de que sí!",
    "Es muy improbable.",
    "Tal vez, pero no tengas esperanzas.",
    "¡Claro que sí!",
    "No, lo siento.",
    "¡Puedo!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`❓ *¿SERÁ?*

> ¡Haz una pregunta!

*Ejemplo:*
> .¿Puedo ser rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
