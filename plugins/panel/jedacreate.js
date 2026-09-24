import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'jedacreate',
    alias: ['setjeda', 'paneljeda', 'jedapanel'],
    category: 'panel',
    description: "Establece un tiempo para todos crear paneles de comandos",
    usage: ".jedacreate − Tiempo asignado",
    example: '.jedacreate 5m',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

function parseTime(input) {
    if (!input || input === '0') return 0
    
    const match = input.match(/^(\d+)(s|m|h)?$/i)
    if (!match) return null
    
    const value = parseInt(match[1])
    const unit = (match[2] || 's').toLowerCase()
    
    switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        default: return value * 1000
    }
}

function formatTime(ms) {
    if (ms <= 0) return "Sin espera"
    
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours} horas ${minutes % 60} minutos`
    if (minutes > 0) return `${minutes} minutos ${seconds % 60} segundos`
    return `${seconds} segundos`
}

function handler(m, { sock }) {
    const db = getDatabase()
    const input = m.text?.trim()
    
    const DEFAULT_JEDA = 5 * 60 * 1000
    
    if (!input) {
        const currentJeda = db.setting('panelCreateJeda') ?? DEFAULT_JEDA
        return m.reply(
            `⏱️ *INTERVALO DE CREACIÓN DE PANELES*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ ◦ El retraso actual: *${formatTime(currentJeda)}*\n` +
            `┃ ◦ Por defecto: *5 minutos*
` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`${m.prefix}jedacreate <tiempo>\`\n` +
            `> Ejemplo: \`${m.prefix}jedacreate 5m\` (5 minutos)
` +
            `> Para desactivar: \`${m.prefix}jedacreate 0\`\n\n` +
            `*Formatos de tiempo:*
` +
            `• \`30s\` = 30 segundos
` +
            `• \`5m\` = 5 minutos
` +
            `• \`1h\` = 1 hora`
        )
    }
    
    const jedaMs = parseTime(input)
    
    if (jedaMs === null) {
        return m.reply(`❌ ¡Formato de tiempo inválido!

> Ejemplo: 30s, 5m, 1h`)
    }
    
    db.setting('panelCreateJeda', jedaMs)
    db.setting('panelCreateLastUsed', 0)
    
    m.react('✅')
    
    if (jedaMs === 0) {
        return m.reply(
            `✅ *INTERVALO DESACTIVADO*\n\n` +
            `> Panel crear ahora sin descanso`
        )
    }
    
    return m.reply(
        `✅ *INTERVALO CONFIGURADO*

` +
        `╭┈┈⬡「 ⏱️ *ᴋᴏɴꜰɪɢ* 」\n` +
        `┃ ◦ Intervalo: *${formatTime(jedaMs)}*\n` +
        `╰┈┈⬡\n\n` +
        `> Una vez que se crea el panel, TODO el usuario debe esperar ${formatTime(jedaMs)} antes de poder crear más.`
    )
}

export { pluginConfig as config, handler }
