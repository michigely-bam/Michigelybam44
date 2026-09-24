import moment from 'moment-timezone'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botafk',
    alias: ['afkbot', 'afkmode'],
    category: 'owner',
    description: "El modo Assair para bots no responde al comando, sólo responde mensajes Alute",
    usage: '.botafk <motivo>',
    example: ".Boftafk De nuevo descansar",
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
    const currentAfk = db.setting('botAfk')
    
    if (currentAfk && currentAfk.active) {
        db.setting('botAfk', { active: false })
        await m.react('✅')
        
        const afkDuration = Date.now() - currentAfk.since
        const duration = formatDuration(afkDuration)
        
        return m.reply(
            `✅ *EL BOT VOLVIÓ A ESTAR EN LÍNEA*\n\n` +
            `╭┈┈⬡「 📊 *ESTADÍSTICAS DE AUSENCIA* 」
` +
            `┃ ⏱️ DURACIÓN: \`${duration}\`\n` +
            `┃ 📝 MOTIVO: \`${currentAfk.reason || '-'}\`\n` +
            `╰┈┈⬡\n\n` +
            `> ¡El bot está listo para recibir comandos!`
        )
    } else {
        const reason = m.args.join(' ') || 'AFK'
        
        db.setting('botAfk', {
            active: true,
            reason: reason,
            since: Date.now()
        })
        
        await m.react('💤')
        return m.reply(
            `💤 *BOT AUSENTE*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 MOTIVO: \`${reason}\`\n` +
            `┃ ⏰ ᴅᴇsᴅᴇ: \`${moment().tz('Asia/Jakarta').format('HH:mm:ss')}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🔒 *ACCESO* 」
` +
            `┃ ✅ Owner bot\n` +
            `┃ ✅ El propio bot (fromMe)
` +
            `Todos los demás usuarios
` +
            `╰┈┈⬡\n\n` +
            `> Otros usuarios podrán enviar mensajes AFK
` +
            `> Escribe \`${m.prefix}botafk\` para volver en línea`
        )
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} días ${hours % 24} horas`
    if (hours > 0) return `${hours} horas ${minutes % 60} minutos`
    if (minutes > 0) return `${minutes} minutos ${seconds % 60} segundos`
    return `${seconds} segundos`
}

export { pluginConfig as config, handler }
