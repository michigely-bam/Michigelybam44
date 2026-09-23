const pluginConfig = {
    name: 'mengapa',
    alias: ['kenapa', 'why'],
    category: 'fun',
    description: 'Tanya bot mengapa sesuatu',
    usage: '.mengapa <pertanyaan>',
    example: '.mengapa langit biru?',
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
    'Hmm, pertanyaan bagus! Aku juga bingung.',
    "Porque así funciona.",
    "Porque Dios quiere que sea.",
    'Aku nggak tau, cari di Google aja.',
    "Porque eso es todo.",
    "¿Tal vez por accidente?",
    "Porque el mundo está lleno de misterios.",
    'Hmm, sulit dijelaskan sih.',
    "Porque el universo trabaja de maneras misteriosas.",
    'Aku juga penasaran, kenapa ya?',
    "Porque se supone que tiene que pasar.",
    "Me temo que no tengo la respuesta.",
    "Por eso es tan único para la vida.",
    "Porque cada cosa tiene sus razones.",
    "Necesito tiempo para pensarlo.",
    "Porque esa es la lógica.",
    "Supongo que tiene que ser.",
    "Porque todo está conectado.",
    'Nah itu aku juga mikir!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🤔 *ᴍᴇɴɢᴀᴘᴀ*

> ¡Póngase en una pregunta!

*Contoh:*
> .mengapa langit biru?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }