const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: "Pide al bot que califique algo",
    usage: '.rate <algo>',
    example: '.rate mi rostro',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: "¡Perfecto! ¡No hay nadie igual!" },
    { score: '9/10', comment: "¡Casi perfecto! ¡Genial!" },
    { score: '8/10', comment: "¡Muy bueno! ¡Excelente!" },
    { score: '7/10', comment: "¡Muy bien, por encima de la media!" },
    { score: '6/10', comment: "No está mal, podría ser mejor." },
    { score: '5/10', comment: "Normal, dentro del promedio." },
    { score: '4/10', comment: "Hmm, falta un poco." },
    { score: '3/10', comment: "Necesita muchas mejoras." },
    { score: '2/10', comment: "Bueno, está lejos del bien." },
    { score: '1/10', comment: "Lo siento, pero esto es terrible." },
    { score: '100/10', comment: 'LEGEND! Beyond perfect!' },
    { score: '11/10', comment: "¡Supera las expectativas!" },
    { score: '69/100', comment: 'Nice...' },
    { score: '420/10', comment: 'BLAZING!' },
    { score: '∞/10', comment: "¡Impresionante!" },
    { score: '7.5/10', comment: 'Solid! Good job!' },
    { score: '8.5/10', comment: 'Impressive!' },
    { score: '9.5/10', comment: 'Near perfection!' },
    { score: '-1/10', comment: "No sé qué decir..." },
    { score: '???/10', comment: 'Error 404: Rating not found.' }
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⭐ *ʀᴀᴛᴇ*

> ¡Introdúzcase algo para ser juzgado!

*Ejemplo:*
> .rate mi rostro`);
    }
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    await m.reply(`Mi calificación: *${rating.score}*
${rating.comment}`);
}

export { pluginConfig as config, handler }
