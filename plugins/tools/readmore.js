const pluginConfig = {
    name: 'readmore',
    alias: ['selengkapnya', 'spoiler'],
    category: 'tools',
    description: "Crear texto «leer más» (spoiler)",
    usage: '.readmore <texto_inicial>|<texto_final>',
    example: '.readmore Texto visible|Texto oculto',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

function handler(m, { sock }) {
    const text = m.text;
    
    if (!text) {
        return m.reply(`⚠️ ¡Introduce el texto!\nEjemplo: \`${m.prefix}${m.command} Hola|Este texto está oculto\``);
    }
    
    let [l, r] = text.split('|');
    if (!l) l = '';
    if (!r) r = '';
    
    const readmore = String.fromCharCode(8206).repeat(4001);
    
    m.reply(l + readmore + r);
}

export { pluginConfig as config, handler }
