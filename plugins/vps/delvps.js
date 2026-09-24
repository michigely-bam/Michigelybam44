import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: ['delvps', 'deldroplet', 'deletevps'],
    alias: [],
    category: 'vps',
    description: "Eliminar el océano VPS digital",
    usage: '.delvps <id>',
    example: '.delvps 123456789',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function hasAccess(sender, isOwner) {
    if (isOwner) return true
    const cleanSender = sender?.split('@')[0]
    if (!cleanSender) return false
    const doConfig = config.digitalocean || {}
    return (doConfig.sellers || []).includes(cleanSender) || 
           (doConfig.ownerPanels || []).includes(cleanSender)
}

async function handler(m, { sock }) {
    const token = config.digitalocean?.token
    
    if (!token) {
        return m.reply(`⚠️ *DigitalOcean aún no está configurado*`)
    }
    
    if (!hasAccess(m.sender, m.isOwner)) {
        return m.reply(`❌ *se rechazó el acceso*`)
    }
    
    const dropletId = m.text?.trim()
    if (!dropletId) {
        return m.reply(`⚠️ *MODO DE USO*\n\n> \`${m.prefix}delvps <droplet_id>\`

> Usa \`${m.prefix}listvps\` para ver la identificación`)
    }
    
    await m.reply(`🗑️ *ELIMINANDO ᴠᴘs...*\n\n> ID: \`${dropletId}\``)
    
    try {
        await axios.delete(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        m.react('✅')
        await m.reply(`✅ *vps fue eliminado con éxito*

> ID: \`${dropletId}\``)
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
