import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'similarity',
    alias: ['setsimilarity', 'sim'],
    category: 'owner',
    description: "Funciones de similitud deshabilitado / (sugerencias de los polis)",
    usage: '.similarity <on/off>',
    example: '.similarity on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    if (!args[0]) {
        return m.reply(`⚠️ *modo de uso*

> \`.similarity on\` - Activa
> \`.similarity off\` - Matikan`)
    }
    
    const mode = args[0].toLowerCase()
    
    if (mode === 'on') {
        db.setting('similarity', true)
        await m.react('✅')
        await m.reply(`✅ *COMPLETADO*

> Función de similitud de comandos *ACTIVADA*`)
    } else if (mode === 'off') {
        db.setting('similarity', false)
        await m.react('✅')
        await m.reply(`✅ *COMPLETADO*

> Función de similitud de comandos *DESACTIVADA*`)
    } else {
        return m.reply(`⚠️ *modo de uso*

> \`.similarity on\` - Activa
> \`.similarity off\` - Matikan`)
    }
    
    await db.save()
}

export { pluginConfig as config, handler }
