import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'goodbyeall',
    alias: ['gball', 'globalgoodbye', 'leaveall'],
    category: 'owner',
    description: "Activar / desactivar el adiós en todos los grupos",
    usage: '.goodbyeall <on/off>',
    example: '.goodbyeall on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (!action || !['on', 'off'].includes(action)) {
        return m.reply(
            `👋 *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ*\n\n` +
            `> Activa o desactiva la despedida en TODOS los grupos a la vez

` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ ${m.prefix}goodbyeall on\n` +
            `┃ ${m.prefix}goodbyeall off\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    await m.react('🕕')
    
    try {
        const groups = await sock.groupFetchAllParticipating()
        const groupIds = Object.keys(groups)
        const status = action === 'on'
        let count = 0
        
        for (const groupId of groupIds) {
            db.setGroup(groupId, { leave: status })
            count++
        }
        
        await m.react('✅')
        
        if (status) {
            return m.reply(
                `✅ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
                `┃ 🌐 Total de grupos: *${count}*\n` +
                `┃ ✅ Adiós: *ACTIVO*
` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `¡El miembro que salga será enviado un mensaje de despedida!`
            )
        } else {
            return m.reply(
                `❌ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
                `┃ 🌐 Total de grupos: *${count}*\n` +
                `┃ ❌ Adiós: *NONACTIVO*
` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> Goodbye se desactiva en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[GoodbyeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
