const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will'],
    category: 'fun',
    description: "Pregúntele al bot que sucederá algo.",
    usage: '.akankah <pertanyaan>',
    example: '.akankah aku sukses?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "¡Sí, lo hará!",
    "No, no lo creo.",
    "Tal vez lo haga, tal vez no lo haga.",
    "¡La voluntad de Dios está hecha!",
    'Hmm, sulit diprediksi.',
    'Pasti! Yakin saja!',
    'Kayaknya nggak deh.',
    "Ocurrirá si lo intentas.",
    "Un día, seguro.",
    "No, lo siento.",
    "¡Por supuesto que lo haré!",
    'Hmm, aku ragu.',
    "¡Confíe en el proceso!",
    'Kemungkinannya kecil.',
    "¡Lo hará, estoy seguro!",
    "No lo haré, sólo encontrar otro.",
    "Lo hará, pero lleva tiempo.",
    'InsyaAllah!',
    "Si fuera una coincidencia, lo sería.",
    "¡Sucederá en el momento adecuado!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔮 *ᴀᴋᴀɴᴋᴀʜ*

> ¡Póngase en una pregunta!

*Contoh:*
> .akankah aku sukses?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }