import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
const pluginConfig = {
    name: 'stoppush',
    alias: ['stoppushkontak', 'stoppus'],
    category: 'pushkontak',
    description: "Parar el proceso de pushcontact",
    usage: '.stoppush',
    example: '.stoppush',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!global.statuspush) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*

> No hay rompecabezas de contacto está funcionando`)
    }
    
    global.stoppush = true
    
    m.react('⏹️')
    await m.reply(`⏹️ *sᴛᴏᴘ ᴘᴜsʜ*

> Parar el proceso de contacto...`)
}

export { pluginConfig as config, handler }