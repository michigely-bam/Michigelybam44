const pluginConfig = {
    name: 'kapan',
    alias: ['when'],
    category: 'fun',
    description: "Pregúntale al bot cuándo ocurre algo",
    usage: '.kapan <pregunta>',
    example: ".kapan ¿cuándo me casaré?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "¿Quizá mañana?",
    "Parece que el próximo año.",
    "3 ¡Otro día!",
    "Ha pasado un tiempo.",
    "¡Estaré allí en un minuto!",
    "Cuando el tiempo sea correcto, ocurrirá.",
    "¡El próximo mes!",
    "No sé cuándo, pero ten paciencia.",
    "¡En un futuro próximo!",
    "10 ¿Otro año quizá?",
    "¡No por mucho tiempo!",
    "Si están destinados, se encontrarán.",
    "Mmm, es difícil de predecir.",
    "¡La próxima semana!",
    "¡Cuanto más te esfuerces, más pronto ocurrirá!",
    "Cuando llegue el momento.",
    "Muy pronto, no te preocupes.",
    "Cuando estés listo/a.",
    "¡En cuestión de días!",
    "Cuando estés listo para eso."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⏰ *CUÁNDO*

> ¡Haz una pregunta!

*Ejemplo:*
> .kapan ¿cuándo me casaré?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
