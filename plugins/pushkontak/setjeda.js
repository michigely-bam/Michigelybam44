import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setjeda',
    alias: ['setdelay', 'jeda'],
    category: 'pushkontak',
    description: "Establecer el retraso para pushcontact / jpm",
    usage: '.setjeda <push/jpm> <ms>',
    example: '.setjeda push 5000',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const currentJedaPush = db.setting('jedaPush') || 5000
    const currentJedaJpm = db.setting('jedaJpm') || 5000
    
    if (args.length < 2) {
        return m.reply(
            `⏱️ *CONFIGURAR INTERVALO*

` +
            `╭┈┈⬡「 📋 *CONFIGURACIÓN ACTUAL* 」
` +
            `┃ 📤 INTERVALO DE ENVÍO: \`${currentJedaPush}ms\`\n` +
            `┃ 📢 INTERVALO DE JPM: \`${currentJedaJpm}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `*MODO DE USO:*\n` +
            `> \`${m.prefix}setjeda push 5000\`\n` +
            `> \`${m.prefix}setjeda jpm 6000\`\n\n` +
            `> _1 segundo = 1000ms_`
        )
    }
    
    const target = args[0].toLowerCase()
    const value = parseInt(args[1])
    
    if (!['push', 'jpm'].includes(target)) {
        return m.reply(`❌ *falló*

> Opciones: \`push\` o \`jpm\``)
    }
    
    if (isNaN(value) || value < 1000) {
        return m.reply(`❌ *falló*

> Ingrese el número mínimo 1000 (1 segundo)`)
    }
    
    if (value > 60000) {
        return m.reply(`❌ *falló*

> Máximo 60000 (1 minuto)`)
    }
    
    if (target === 'push') {
        db.setting('jedaPush', value)
        m.react('✅')
        return m.reply(`✅ *Intervalo de envío actualizado*

> Intervalo: \`${value}ms\` (${value/1000} segundos)`)
    }
    
    if (target === 'jpm') {
        db.setting('jedaJpm', value)
        m.react('✅')
        return m.reply(`✅ *Intervalo de difusión actualizado*

> Intervalo: \`${value}ms\` (${value/1000} segundos)`)
    }
}

export { pluginConfig as config, handler }
