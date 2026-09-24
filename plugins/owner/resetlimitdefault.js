import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'resetlimitdefault',
    alias: ['defaultlimitreset'],
    category: 'owner',
    description: "Reiniciar el límite predeterminado al config original",
    usage: '.resetlimitdefault',
    example: '.resetlimitdefault',
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
    const configDefault = config.limits?.default || 25
    
    db.setting('defaultLimit', null)
    
    await m.reply(
        `✅ *correcto*

` +
        `> Default limit se ha resetado a config: \`${configDefault}\`\n` +
        `> El nuevo usuario obtendrá un límite de configuración`
    )
}

export { pluginConfig as config, handler }