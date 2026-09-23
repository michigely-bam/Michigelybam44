const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Tanya bot bisakah sesuatu',
    usage: '.bisakah <pertanyaan>',
    example: '.bisakah aku lulus ujian?',
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
    'Hmm, kayaknya susah deh.',
    "¡Sí, puedes!",
    "No puedo, lo siento.",
    "Podría funcionar, si es difícil.",
    "¡Puedes hacerlo, no te rindas!",
    "Es un poco difícil, pero puedo intentarlo.",
    "¡Puedes hacerlo!",
    'Kayaknya nggak deh.',
    "¡Puedes hacerlo!",
    'Hmm... aku ragu.',
    "¡Puedes hacerlo, puedes hacerlo!",
    "No, prueba algo más.",
    "¡Confía en ti mismo!",
    "Es difícil, pero eso no significa que sea imposible.",
    "¡Por supuesto!",
    'Kayaknya perlu usaha ekstra nih.',
    "¡No dudes de ti mismo!",
    "Inténtalo de nuevo más tarde.",
    "¡Te creo!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`💪 *ʙɪsᴀᴋᴀʜ*

> ¡Póngase en una pregunta!

*Contoh:*
> .bisakah aku lulus ujian?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }