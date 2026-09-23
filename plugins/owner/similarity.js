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
        return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`.similarity on\` - Aktifkan\n> \`.similarity off\` - Matikan`)
    }
    
    const mode = args[0].toLowerCase()
    
    if (mode === 'on') {
        db.setting('similarity', true)
        await m.react('✅')
        await m.reply(`✅ *sᴜᴋsᴇs*

> Función de comando de firmas *DIAKTIFKAN*`)
    } else if (mode === 'off') {
        db.setting('similarity', false)
        await m.react('✅')
        await m.reply(`✅ *sᴜᴋsᴇs*

> Función de comando de firmas *DIMATIKAN*`)
    } else {
        return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`.similarity on\` - Aktifkan\n> \`.similarity off\` - Matikan`)
    }
    
    await db.save()
}

export { pluginConfig as config, handler }