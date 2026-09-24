import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetwarn',
    alias: ['clearwarn', 'hapuswarn', 'delwarn'],
    category: 'group',
    description: "Restablece las advertencias de un miembro",
    usage: '.resetwarn @user',
    example: '.resetwarn @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> Responder a los mensajes del usuario + \`${m.prefix}resetwarn\`\n` +
            `> O: \`${m.prefix}resetwarn @user\``
        )
        return
    }
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3
    
    const targetName = targetUser.split('@')[0]
    
    if (!warnings[targetUser] || warnings[targetUser].length === 0) {
        await m.reply(`✅ @${targetName} no tiene advertencia.`, { mentions: [targetUser] })
        return
    }
    
    const prevCount = warnings[targetUser].length
    delete warnings[targetUser]
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    await m.reply(
        `✅ *ᴡᴀʀɴɪɴɢ RESTABLECIDO*\n` +
        `Warning @${targetName} ¡Se ha rescatado!
` +
        `Anteriormente: *${prevCount}/${maxWarns}*\n` +
        `Ahora mismo:${maxWarns}*`,
        { mentions: [targetUser] }
    )
}

export { pluginConfig as config, handler }
