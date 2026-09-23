const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: 'Minta bot memberi rating sesuatu',
    usage: '.rate <sesuatu>',
    example: '.rate wajahku',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: 'Sempurna! Nggak ada duanya!' },
    { score: '9/10', comment: 'Hampir sempurna! Keren banget!' },
    { score: '8/10', comment: 'Bagus banget! Mantap!' },
    { score: '7/10', comment: 'Cukup bagus, di atas rata-rata!' },
    { score: '6/10', comment: "No está mal, podría ser mejor." },
    { score: '5/10', comment: 'Biasa aja sih, standar.' },
    { score: '4/10', comment: 'Hmm, kurang sedikit.' },
    { score: '3/10', comment: 'Perlu banyak perbaikan.' },
    { score: '2/10', comment: "Bueno, está lejos del bien." },
    { score: '1/10', comment: "Lo siento, pero esto es terrible." },
    { score: '100/10', comment: 'LEGEND! Beyond perfect!' },
    { score: '11/10', comment: 'Melebihi ekspektasi!' },
    { score: '69/100', comment: 'Nice...' },
    { score: '420/10', comment: 'BLAZING!' },
    { score: '∞/10', comment: 'Gacor kang' },
    { score: '7.5/10', comment: 'Solid! Good job!' },
    { score: '8.5/10', comment: 'Impressive!' },
    { score: '9.5/10', comment: 'Near perfection!' },
    { score: '-1/10', comment: 'Aku nggak tau harus ngomong apa...' },
    { score: '???/10', comment: 'Error 404: Rating not found.' }
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⭐ *ʀᴀᴛᴇ*

> ¡Introdúzcase algo para ser juzgado!

*Contoh:*
> .rate wajahku`);
    }
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    await m.reply(`Rating dari aku: *${rating.score}*
${rating.comment}`);
}

export { pluginConfig as config, handler }