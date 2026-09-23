const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how'],
    category: 'fun',
    description: 'Tanya bot bagaimana sesuatu',
    usage: '.bagaimana <pertanyaan>',
    example: '.bagaimana cara jadi sukses?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Caranya gampang, ya tinggal dilakuin aja!',
    "Es difícil de explicar.",
    "Con esfuerzo y oración, por supuesto.",
    'Ya begitulah caranya.',
    "No lo sé, trata de encontrar otra referencia.",
    "Pelan-pelan Puedes hacerlo más tarde.",
    "¡Con trabajo duro y sin rendición!",
    'Pertama, percaya sama diri sendiri dulu.',
    'Hmm, tiap orang beda-beda sih caranya.',
    'Ikutin kata hatimu aja.',
    "Aprende de la experiencia.",
    "Paso a paso, no te apresures.",
    "¡Con firme determinación!",
    "Primero empieza pequeña.",
    "Constante, más tarde.",
    "¡No pienses demasiado, acción!",
    "¡Es fácil, sólo empieza!",
    'Caranya? Ya dicoba dulu!',
    "Con la estrategia correcta.",
    "Todavía estoy aprendiendo."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📋 *ʙᴀɢᴀɪᴍᴀɴᴀ*

> ¡Póngase en una pregunta!

*Contoh:*
> .bagaimana cara jadi sukses?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }