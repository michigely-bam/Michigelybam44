const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how'],
    category: 'fun',
    description: "Pregúntale al bot cómo es algo",
    usage: '.bagaimana <pregunta>',
    example: ".bagaimana ¿cómo puedo tener éxito?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "Es fácil: ¡solo tienes que hacerlo!",
    "Es difícil de explicar.",
    "Con esfuerzo y oración, por supuesto.",
    "Así es como se hace.",
    "No lo sé, trata de encontrar otra referencia.",
    "Ve poco a poco; puedes hacerlo más tarde.",
    "¡Con trabajo duro y sin rendición!",
    "Primero, confía en ti.",
    "Mmm, cada persona tiene su propia forma.",
    "Sigue a tu corazón.",
    "Aprende de la experiencia.",
    "Paso a paso, no te apresures.",
    "¡Con firme determinación!",
    "Primero empieza pequeña.",
    "Constante, más tarde.",
    "¡No pienses demasiado, acción!",
    "¡Es fácil, sólo empieza!",
    "¿Cómo? ¡Inténtalo primero!",
    "Con la estrategia correcta.",
    "Todavía estoy aprendiendo."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📋 *CÓMO*

> ¡Haz una pregunta!

*Ejemplo:*
> .bagaimana ¿cómo puedo tener éxito?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
