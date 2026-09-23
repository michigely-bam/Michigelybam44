const pluginConfig = {
    name: 'apakah',
    alias: ['apa'],
    category: 'fun',
    description: 'Tanya bot apakah sesuatu',
    usage: '.apakah <pertanyaan>',
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
    'Ya, tentu saja!',
    "No, no lo creo.",
    "Tal vez, intente de nuevo más tarde.",
    'Hmm... aku rasa iya.',
    "Lo dudo, pero podría ser.",
    'Pasti! 100%!',
    "De ninguna manera.",
    "Podría ser, ¿quién sabe?",
    'Menurutku sih iya.',
    'Wah, kayaknya nggak deh.',
    "Claro, ¿por qué no?",
    "No lo sé, pregúntame otra cosa.",
    'Ya ampun, pasti lah!',
    "No lo creo.",
    'Aku yakin iya!',
    'Nggak mungkin banget.',
    "Tal vez, pero no tengas esperanzas.",
    'Iya dong!',
    'Nggak, maaf ya.',
    "¡Puedo!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`❓ *ᴀᴘᴀᴋᴀʜ*

> ¡Póngase en una pregunta!

*Contoh:*
> .¿Puedo ser rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }