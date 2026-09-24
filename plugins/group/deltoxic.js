import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'deltoxic',
    alias: ['hapustoxic', 'remtoxic', 'removetoxic'],
    category: 'group',
    description: "Eliminar la palabra tóxica de la lista",
    usage: '.deltoxic <palabra>',
    example: ".deltoxic palabras_casar",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()
    
    if (!word) {
        return m.reply(
            `🗑️ *ᴅᴇʟ ᴛᴏxɪᴄ*\n\n` +
            `> Utilice: \`.deltoxic <palabra>\`

` +
            `\`Ejemplo: ${m.prefix}deltoxic katakasar\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    const index = toxicWords.indexOf(word)
    
    if (index === -1) {
        return m.reply(`❌ *falló*

> Palabra \`${word}\` no está en la lista`)
    }
    
    toxicWords.splice(index, 1)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *la palabra tóxica fue eliminada*

` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 PALABRA: \`${word}\`\n` +
        `┃ 📊 restante: \`${toxicWords.length}\` palabra
` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
