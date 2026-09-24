import { getAllPlugins } from '../../src/lib/ourin-plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitowner',
    alias: ['ownerbenefits', 'ownerfitur'],
    category: 'main',
    description: "Ver características y explicaciones especiales del propietario",
    usage: '.benefitowner',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const ownerCommands = plugins.filter(p => p.config.isOwner && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of ownerCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    
    const message = 
        `👑 *¿QUÉ ES EL PROPIETARIO?*\n\n` +
        `Owner es el *propietario del bot* que tiene acceso completo a todas las características y controles del sistema.

` +
        `╭┈┈⬡「 🔐 *VENTAJAS DEL PROPIETARIO* 」\n` +
        `┃ ✦ \`\`\`Acceso a todos los comandos sin restricciones\`\`\`\n` +
        `┃ ✦ \`\`\`Límite ilimitado (-1)\`\`\`\n` +
        `┃ ✦ \`\`\`Sin tiempos de espera\`\`\`\n` +
        `┃ ✦ \`\`\`Control completo del sistema del bot\`\`\`\n` +
        `┃ ✦ \`\`\`Gestión de usuarios y grupos\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso al panel y a los servidores\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *CÓMO FUNCIONA* 」\n` +
        `┃ \`El propietario se añade mediante:\`\n` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addowner <número>\`\`\`\n` +
        `┃ • O directamente en config.js
` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *COMANDOS DEL PROPIETARIO* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        commandList.map(cmd => `┃ ${cmd}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `¡Conoce al propietario para obtener acceso!`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }
