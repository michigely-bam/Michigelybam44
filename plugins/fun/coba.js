const pluginConfig = {
    name: 'coba',
    alias: ['try'],
    category: 'fun',
    description: "Preguntemos algo en el bot.",
    usage: ".coba <pregunta>",
    example: ".Adivina lo que estaba pensando.",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    "Estoy tratando de... ¡estás pensando en la comida!",
    "Supongo que... ¡estás de humor!",
    "Pruébalo... ¡Creo que te estás divirtiendo!",
    "Hmm, creo que estás confundido.",
    "Estoy tratando de imaginar... ¿te estás perdiendo a alguien?",
    "Creo que te lo estás tomando fácil.",
    "Supongo que estás grabando tus teléfonos.",
    "Debe estar aburrido, ¿eh?",
    "Vamos a ver... ¡quieres ir a dar un paseo!",
    "Pensé que podrías necesitar entretenimiento.",
    "Hmm, creo que eres feliz!",
    "Estoy tratando... ¡Debes tener curiosidad!",
    "Estás en la cama.",
    "Probablemente estás pensando en alguien especial.",
    "Estoy tratando: ¿Estás tratando de hablar?",
    "¡Creo que estás jugando un juego!",
    "Supongo que estás escuchando música.",
    "Déjame adivinar... ¡estás en la habitación!",
    "Creo que estás esperando algo.",
    "Hmm, mi suposición: ¡necesitas un amigo con quien hablar!"
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🎯 *intento*

> ¡Pon algo!

*Ejemplo:*
> .Adivina lo que estaba pensando.`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
