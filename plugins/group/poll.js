const pluginConfig = {
    name: 'poll',
    alias: ['voting', 'vote', 'survei'],
    category: 'group',
    description: "Crear votación / votación en grupo",
    usage: '.poll <pregunta> | <opción1>, <opción2>, ...',
    example: ".poll ¿Qué comemos? | Arroz frito, Fideos con pollo, Albóndigas",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';
    
    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `¡El formato no es válido!

` +
            `*Formato:*\n` +
            `> \`.poll pregunta | opción1, opción2\`\n\n` +
            `*Ejemplo:*
` +
            `> \`.poll ¿Qué comemos para el almuerzo? | Arroz frito, Fideos con pollo\`

` +
            `*Opciones adicionales:*
` +
            `> \`.poll multi | pregunta | opción1, opción2, opción3, etc.\`\n` +
            `> (para opciones dobles)`
        );
        return;
    }
    
    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());
    
    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }
    
    if (parts.length < 2) {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `> Formato: \`pregunta | opción1, opción2, ...\``
        );
        return;
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `> ¡Elige al menos 2 opciones!`
        );
        return;
    }
    
    if (options.length > 12) {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `> ¡Puedes elegir un máximo de 12 opciones!`
        );
        return;
    }
    
    if (question.length > 255) {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `¡Las preguntas son demasiado largas!
` +
            `Un máximo de 255 caracteres.`
        );
        return;
    }
    
    try {
        const pollMsg = `✅ Encuesta creada correctamente`;
        
        await m.reply(pollMsg, { mentions: [m.sender] });
        
        await sock.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Fallo de las encuestas.
` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
