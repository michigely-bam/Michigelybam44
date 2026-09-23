const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: 'Tanya bot dimana sesuatu',
    usage: '.dimana <pertanyaan>',
    example: '.dimana jodohku berada?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Di dekatmu!',
    'Jauh di sana.',
    "En un lugar que no esperabas.",
    'Di hatimu.',
    'Di sekitar sini.',
    "Prueba la habitación.",
    'Di luar sana, menunggumu.',
    "En el mismo lugar que tú.",
    "En algún lugar hermoso.",
    'Di balik pintu.',
    'Di sebelah kirimu.',
    'Di depan matamu!',
    'Jauh banget, di luar negeri mungkin?',
    "En un lugar de recuerdos.",
    'Di mana-mana!',
    'Di dunia maya.',
    'Di alam mimpi.',
    'Di tempat rahasia.',
    'Hmm, susah dijelaskan lokasinya.',
    "En un lugar que te hará feliz."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*

> ¡Póngase en una pregunta!

*Contoh:*
> .dimana jodohku berada?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }