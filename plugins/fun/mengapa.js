const pluginConfig = {
    name: 'mengapa',
    alias: ['kenapa', 'why'],
    category: 'fun',
    description: "Pregúntale al bot por qué ocurre algo",
    usage: '.mengapa <pregunta>',
    example: ".mengapa ¿por qué el cielo es azul?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "Porque estaba destinado a serlo.",
    "Mmm, ¡buena pregunta! Yo también tengo dudas.",
    "Porque así funciona.",
    "Porque Dios quiere que sea.",
    "No lo sé; búscalo en Google.",
    "Porque eso es todo.",
    "¿Tal vez por accidente?",
    "Porque el mundo está lleno de misterios.",
    "Mmm, es difícil de explicar.",
    "Porque el universo trabaja de maneras misteriosas.",
    "Yo también tengo curiosidad. ¿Por qué será?",
    "Porque se supone que tiene que pasar.",
    "Me temo que no tengo la respuesta.",
    "Por eso es tan único para la vida.",
    "Porque cada cosa tiene sus razones.",
    "Necesito tiempo para pensarlo.",
    "Porque esa es la lógica.",
    "Supongo que tiene que ser.",
    "Porque todo está conectado.",
    "¡Eso mismo estaba pensando!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🤔 *POR QUÉ*

> ¡Haz una pregunta!

*Ejemplo:*
> .mengapa ¿por qué el cielo es azul?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
