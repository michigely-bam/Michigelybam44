import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: ['disableenergi', 'enableenergi'],
    alias: ['offenergi', 'onenergi'],
    category: 'owner',
    description: "Activa o desactiva el sistema de energía",
    usage: ".disableenergi o .enableenergi",
    example: '.disableenergi',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isEnable = ['enableenergi', 'onenergi'].includes(cmd)

    db.setting('energi', isEnable)
    db.save()

    await m.react(isEnable ? '⚡' : '🔌')
    return m.reply(
        isEnable
            ? "⚡ *SISTEMA DE ENERGÍA ACTIVADO*\n\nCada comando ahora requiere energía."
            : "🔌 *el sistema de energía está desactivado*\n\n> El mando ya no requiere energía."
    )
}

export { pluginConfig as config, handler }
