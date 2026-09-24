import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'delpanel',
    alias: ['hapuspanel', 'deletepanel'],
    category: 'panel',
    description: "Borrar el panel (servidor + usuario)",
    usage: '.delpanel [s1/s2/s3] serverid [full]',
    example: ".delpanel 5 o .delpanel s2 5 full",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function getServerConfig(pteroConfig, serverKey) {
    const serverConfigs = {
        's1': pteroConfig.server1,
        's2': pteroConfig.server2,
        's3': pteroConfig.server3
    }
    return serverConfigs[serverKey] || pteroConfig.server1
}

function validateServerConfig(serverConfig) {
    const missing = []
    if (!serverConfig?.domain) missing.push('domain')
    if (!serverConfig?.apikey) missing.push('apikey (PTLA)')
    return missing
}

function getAvailableServers(pteroConfig) {
    const available = []
    if (pteroConfig.server1?.domain && pteroConfig.server1?.apikey) available.push('s1')
    if (pteroConfig.server2?.domain && pteroConfig.server2?.apikey) available.push('s2')
    if (pteroConfig.server3?.domain && pteroConfig.server3?.apikey) available.push('s3')
    return available
}

async function handler(m, { sock }) {
    const pteroConfig = config.pterodactyl
    
    const args = m.text?.trim().split(' ') || []
    let serverKey = 's1'
    let restArgs = args
    
    if (args[0] && ['s1', 's2', 's3'].includes(args[0].toLowerCase())) {
        serverKey = args[0].toLowerCase()
        restArgs = args.slice(1)
    }
    
    const serverConfig = getServerConfig(pteroConfig, serverKey)
    const missingConfig = validateServerConfig(serverConfig)
    
    if (missingConfig.length > 0) {
        const available = getAvailableServers(pteroConfig)
        let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverKey.toUpperCase()} SIN CONFIGURAR*\n\n`
        if (available.length > 0) {
            txt += `> Servidor disponible: *${available.join(', ')}*`
        }
        return m.reply(txt)
    }
    
    const serverId = restArgs[0]
    const option = restArgs[1]?.toLowerCase()
    const serverLabel = serverKey.toUpperCase()
    
    if (!serverId) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}delpanel ID\` - Sólo elimine el servidor
` +
            `> \`${m.prefix}delpanel ID full\` - Eliminar el servidor + el usuario
` +
            `> \`${m.prefix}delpanel s2 ID\` - Desde el servidor 2

` +
            `> Ver ID con \`${m.prefix}listserver\``
        )
    }
    
    if (isNaN(serverId)) {
        return m.reply(`❌ El servidor ID debe ser un número.`)
    }
    
    try {
        const serverRes = await axios.get(`${serverConfig.domain}/api/application/servers/${serverId}`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        const server = serverRes.data.attributes
        const userId = server.user
        
        let userInfo = null
        let isUserAdmin = false
        try {
            const userRes = await axios.get(`${serverConfig.domain}/api/application/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${serverConfig.apikey}` }
            })
            userInfo = userRes.data.attributes
            isUserAdmin = userInfo.root_admin
        } catch (e) {}
        
        await m.reply(`🗑️ *ELIMINANDO ᴘᴀɴᴇʟ...*\n\n> Server: *${serverLabel}*\n> Panel: \`${server.name}\`\n> Mode: *${option === 'full' ? 'Server + User' : "Solo el servidor"}*`)
        
        await axios.delete(`${serverConfig.domain}/api/application/servers/${serverId}`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        let result = `✅ *el servidor fue eliminado [${serverLabel}]*\n\n`
        result += `> Nombre: \`${server.name}\`\n`
        result += `> ID: \`${serverId}\`\n`
        
        if (option === 'full' && userInfo && !isUserAdmin) {
            try {
                await axios.delete(`${serverConfig.domain}/api/application/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${serverConfig.apikey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json'
                    }
                })
                result += `
✅ *usuario eliminado*
`
                result += `> Username: \`${userInfo.username}\`\n`
                result += `> ID: \`${userId}\``
            } catch (userErr) {
                result += `
⚠️ El usuario no ha eliminado (puede tener otro servidor)`
            }
        } else if (option === 'full' && isUserAdmin) {
            result += `
⚠️ El usuario es Admin, no se elimina`
        }
        
        return m.reply(result)
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
