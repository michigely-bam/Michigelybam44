const pluginConfig = {
    name: 'stopjpm',
    alias: ['stopjasher', 'stopjaser'],
    category: 'jpm',
    description: "Stop JPM process",
    usage: '.stopjpm',
    example: '.stopjpm',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!global.statusjpm) {
        return m.reply(`❌ *falló*

> No JPM running`)
    }
    
    global.stopjpm = true
    
    m.react('⏹️')
    await m.reply(`⏹️ *sᴛᴏᴘ ᴊᴘᴍ*
Detener el proceso de JPM...`)
}

export { pluginConfig as config, handler }