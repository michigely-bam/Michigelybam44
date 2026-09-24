const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: "Pregúntale al bot si puede hacer algo",
    usage: '.bisakah <pregunta>',
    example: ".bisakah ¿aprobaré el examen?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "¡Confía en mí!",
    "Mmm, parece difícil.",
    "¡Sí, puedes!",
    "No puedo, lo siento.",
    "Podría funcionar, si es difícil.",
    "¡Puedes hacerlo, no te rindas!",
    "Es un poco difícil, pero puedo intentarlo.",
    "¡Puedes hacerlo!",
    "Parece que no.",
    "¡Puedes hacerlo!",
    'Mmm... tengo mis dudas.',
    "¡Puedes hacerlo, puedes hacerlo!",
    "No, prueba algo más.",
    "¡Confía en ti mismo!",
    "Es difícil, pero eso no significa que sea imposible.",
    "¡Por supuesto!",
    "Parece que necesitará un esfuerzo extra.",
    "¡No dudes de ti mismo!",
    "Inténtalo de nuevo más tarde.",
    "¡Te creo!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`💪 *¿PODRÉ?*

> ¡Haz una pregunta!

*Ejemplo:*
> .bisakah ¿aprobaré el examen?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
