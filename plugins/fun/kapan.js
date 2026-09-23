const pluginConfig = {
    name: 'kapan',
    alias: ['when'],
    category: 'fun',
    description: 'Tanya bot kapan sesuatu',
    usage: '.kapan <pertanyaan>',
    example: '.kapan aku nikah?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Besok mungkin?',
    'Tahun depan kayaknya.',
    "3 ¡Otro día!",
    "Ha pasado un tiempo.",
    "¡Estaré allí en un minuto!",
    "Cuando el tiempo sea correcto, ocurrirá.",
    'Bulan depan!',
    "No sé cuándo, pero ten paciencia.",
    "¡En un futuro próximo!",
    "10 ¿Otro año quizá?",
    "¡No por mucho tiempo!",
    'Kalau jodoh, pasti ketemu.',
    'Hmm, susah diprediksi.',
    'Minggu depan!',
    'Kalau usahanya lebih keras, lebih cepat!',
    'Pas waktunya tepat.',
    'Secepatnya, tenang aja.',
    'Ntar kalo udah siap.',
    "¡En cuestión de días!",
    "Cuando estés listo para eso."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⏰ *ᴋᴀᴘᴀɴ*

> ¡Póngase en una pregunta!

*Contoh:*
> .kapan aku nikah?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }