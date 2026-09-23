import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'onlygc',
    alias: ['onlygroup', 'grouponly'],
    category: 'owner',
    description: "Toggle modo bot sólo en grupo",
    usage: '.onlygc',
    example: '.onlygc',
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
    const currentMode = db.setting('onlyGc') || false
    
    if (currentMode) {
        db.setting('onlyGc', false)
        await m.react('❌')
        return m.reply(`❌ *ᴏɴʟʏ ɢʀᴏᴜᴘ ᴍᴏᴅᴇ ɴᴏɴᴀᴋᴛɪꜰ*

> Bot se puede acceder a cualquier lugar`)
    } else {
        db.setting('onlyGc', true)
        db.setting('onlyPc', false)
        await m.react('✅')
        return m.reply(`✅ *ᴏɴʟʏ ɢʀᴏᴜᴘ ᴍᴏᴅᴇ ᴀᴋᴛɪꜰ*

> Bot es accesible en el grupo!`)
    }
}

export { pluginConfig as config, handler }