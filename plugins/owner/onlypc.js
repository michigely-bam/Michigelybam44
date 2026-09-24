import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'onlypc',
    alias: ['onlyprivate', 'privateonly'],
    category: 'owner',
    description: "Toggle modo bot sólo en chat privado",
    usage: '.onlypc',
    example: '.onlypc',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const currentMode = db.setting('onlyPc') || false
    
    if (currentMode) {
        db.setting('onlyPc', false)
        await m.react('❌')
        return m.reply(`❌ *only private mode inactivo*

> Bot se puede acceder a cualquier lugar`)
    } else {
        db.setting('onlyPc', true)
        db.setting('onlyGc', false)
        await m.react('✅')
        return m.reply(`✅ *only private mode activado*

> Bot sólo se puede acceder en chat privado!`)
    }
}

export { pluginConfig as config, handler }