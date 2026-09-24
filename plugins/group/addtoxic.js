import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addtoxic',
    alias: ['tambahtoxic', 'addkata'],
    category: 'group',
    description: "Añadir una palabra tóxica a la lista",
    usage: '.addtoxic <palabra>',
    example: ".addtoxic palabras_casar",
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
            `📝 *ᴀᴅᴅ ᴛᴏxɪᴄ*\n\n` +
            `> Utilice: \`.addtoxic <palabra>\`

` +
            `\`Ejemplo: ${m.prefix}addtoxic katakasar\``
        )
    }
    
    if (word.length < 2) {
        return m.reply(`❌ *falló*

> La palabra es demasiado corta (mínimo 2 letras)`)
    }
    
    if (word.length > 30) {
        return m.reply(`❌ *falló*

> La palabra es demasiado larga (máximo 30 letras)`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    if (toxicWords.includes(word)) {
        return m.reply(`❌ *falló*

> Palabra \`${word}\` Ya está en la lista.`)
    }
    
    toxicWords.push(word)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *palabras tóxicas añadidas*

` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 PALABRA: \`${word}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${toxicWords.length}\` palabra
` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
