const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: "Pregúntale al bot si debes hacer algo",
    usage: '.haruskah <pregunta>',
    example: ".haruskah ¿debería declarar mi amor?",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "¡Sí, debes hacerlo!",
    "No, estoy bien.",
    "Lo que tú digas.",
    "¡Tienes que hacerlo, no lo dudes!",
    "No es obligatorio.",
    "Si crees que es necesario, ¡hazlo!",
    "Piénsalo bien primero.",
    '¡Debes hacerlo ahora!',
    "No, espera un minuto.",
    "Debes hacerlo, pero ten cuidado.",
    "No tienes que hacerlo, pero puedes.",
    '¡Es obligatorio!',
    "Mmm, mejor déjalo pasar.",
    "Hazlo cuando estés seguro.",
    "¡Debes hacerlo por tu futuro!",
    "No tienes que hacerlo; relájate.",
    '¡Hazlo!',
    "No te apresures, piensa de nuevo.",
    "¡Por supuesto que debes hacerlo!",
    "Mira la situación primero."
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⚖️ *¿DEBERÍA?*

> ¡Haz una pregunta!

*Ejemplo:*
> .haruskah ¿debería declarar mi amor?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
