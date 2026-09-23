const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: 'Tanya bot haruskah sesuatu',
    usage: '.haruskah <pertanyaan>',
    example: '.haruskah aku menyatakan cinta?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Ya, harus!',
    "No, estoy bien.",
    "Lo que tú digas.",
    "¡Tienes que hacerlo, no lo dudes!",
    'Nggak harus juga.',
    'Kalau menurutmu perlu, lakukan!',
    'Pikir dulu baik-baik.',
    'Harus! Sekarang!',
    "No, espera un minuto.",
    'Harus, tapi hati-hati.',
    'Nggak harus, tapi boleh.',
    'Wajib!',
    'Hmm, skip aja deh.',
    "Hazlo cuando estés seguro.",
    'Harus, demi masa depanmu!',
    'Nggak harus, santai aja.',
    'Go for it!',
    "No te apresures, piensa de nuevo.",
    'Tentu harus!',
    "Mira la situación primero."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⚖️ *ʜᴀʀᴜsᴋᴀʜ*

> ¡Póngase en una pregunta!

*Contoh:*
> .haruskah aku menyatakan cinta?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }