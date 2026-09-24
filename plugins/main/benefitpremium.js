import { getAllPlugins } from '../../src/lib/ourin-plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitpremium',
    alias: ['premiumbenefits', 'premiumfitur', 'benefitprem'],
    category: 'main',
    description: "Ver características y explicaciones especiales Premium",
    usage: '.benefitpremium',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const premiumCommands = plugins.filter(p => p.config.isPremium && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of premiumCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    const defaultLimit = config.limits?.default || 25
    const premiumLimit = config.limits?.premium || 100
    
    const message = 
        `⭐ *¿QUÉ ES PRÉMIUM?*\n\n` +
        `El Premium es el *usuario pagado* que obtiene acceso a las características exclusivas y más beneficios.

` +
        `╭┈┈⬡「 💎 *VENTAJAS PRÉMIUM* 」\n` +
        `┃ ✦ \`\`\`Límite diario: ${premiumLimit}x (frente a ${defaultLimit}x del usuario normal)\`\`\`
` +
        `┃ ✦ \`\`\`Tiempos de espera más cortos\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso a funciones exclusivas\`\`\`\n` +
        `┃ ✦ \`\`\`Prioridad de respuesta\`\`\`\n` +
        `┃ ✦ \`\`\`Sin marca de agua en algunas funciones\`\`\`\n` +
        `┃ ✦ \`\`\`Atención prioritaria\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *CÓMO OBTENERLO* 」\n` +
        `┃ \`El acceso prémium se obtiene mediante:\`\n` +
        `┃ • Contacta con el propietario del bot
` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addprem <número> <duración>\`\`\`\n` +
        `┃ • Ejemplo: .addprem 628xxx 30d\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *COMANDOS PRÉMIUM* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        (totalCommands > 0 
            ? commandList.map(cmd => `┃ ${cmd}`).join('\n')
            : `┃ Todos los comandos son accesibles para el usuario común`) +
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `¿Quieres mejorar tu plan? Contacta con el propietario del bot.
${config.owner.number.map(num => `- wa.me/${num}`).join('\n') }`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }
