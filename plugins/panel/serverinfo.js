import axios from 'axios'
import config from '../../config.js'
import { hasFullAccess, getUserRole, VALID_SERVERS } from '../../src/lib/ourin-roles-cpanel.js'
import te from '../../src/lib/ourin-error.js'
const allCommands = VALID_SERVERS.map(v => `serverinfo${v}`)
const allAliases = VALID_SERVERS.map(v => `sinfo${v}`)

const pluginConfig = {
    name: allCommands,
    alias: allAliases,
    category: 'panel',
    description: 'Info detail server (v1-v5)',
    usage: '.serverinfov1 serverid',
    example: '.serverinfov2 5',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function parseServerVersion(cmd) {
    const match = cmd.match(/v([1-5])$/i)
    if (!match) return { server: 'v1', serverKey: 's1' }
    return { server: 'v' + match[1], serverKey: 's' + match[1] }
}

function getServerConfig(pteroConfig, serverKey) {
    const serverConfigs = {
        's1': pteroConfig.server1,
        's2': pteroConfig.server2,
        's3': pteroConfig.server3,
        's4': pteroConfig.server4,
        's5': pteroConfig.server5
    }
    return serverConfigs[serverKey] || null
}

function validateServerConfig(serverConfig) {
    const missing = []
    if (!serverConfig?.domain) missing.push('domain')
    if (!serverConfig?.apikey) missing.push('apikey (PTLA)')
    return missing
}

function getAvailableServers(pteroConfig) {
    const available = []
    for (let i = 1; i <= 5; i++) {
        const cfg = pteroConfig[`server${i}`]
        if (cfg?.domain && cfg?.apikey) available.push(`v${i}`)
    }
    return available
}

function formatBytes(bytes) {
    if (bytes === 0) return 'Ilimitado'
    const mb = bytes
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
    return `${mb} MB`
}

async function handler(m, { sock }) {
    const pteroConfig = config.pterodactyl
    
    const { server: serverVersion, serverKey } = parseServerVersion(m.command)
    const serverLabel = serverVersion.toUpperCase()
    
    if (!hasFullAccess(m.sender, serverVersion, m.isOwner)) {
        const userRole = getUserRole(m.sender, serverVersion)
        return m.reply(
            `❌ *se rechazó el acceso*

` +
            `No tienes acceso a *${serverLabel}*\n` +
            `> Tu rol: *${userRole || "No hay"}*`
        )
    }
    
    const serverId = m.text?.trim()
    
    const serverConfig = getServerConfig(pteroConfig, serverKey)
    const missingConfig = validateServerConfig(serverConfig)
    
    if (missingConfig.length > 0) {
        const available = getAvailableServers(pteroConfig)
        let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverLabel} SIN CONFIGURAR*\n\n`
        if (available.length > 0) {
            txt += `> Servidor disponible: *${available.join(', ')}*`
        }
        return m.reply(txt)
    }
    
    if (!serverId || isNaN(serverId)) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}${m.command} serverid\`\n\n` +
            `> Ver ID con \`${m.prefix}listserver${serverVersion}\``
        )
    }
    
    try {
        const serverRes = await axios.get(`${serverConfig.domain}/api/application/servers/${serverId}`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        const s = serverRes.data.attributes
        const limits = s.limits || {}
        const features = s.feature_limits || {}
        
        let txt = `📊 *ɪɴꜰᴏ sᴇʀᴠᴇʀ [${serverLabel}]*\n\n`
        txt += `╭─「 📋 *ᴅᴇᴛᴀɪʟ* 」\n`
        txt += `┃ 🆔 \`ɪᴅ\`: *${s.id}*\n`
        txt += `┃ 📛 \`NOMBRE\`: *${s.name}*\n`
        txt += `┃ 👤 \`ᴏᴡɴᴇʀ ɪᴅ\`: *${s.user}*\n`
        txt += `┃ 📝 \`DESCRIPCIÓN\`: *${s.description || '-'}*\n`
        txt += `┃ 📊 \`sᴛᴀᴛᴜs\`: *${s.suspended ? '⛔ Suspended' : '✅ Active'}*\n`
        txt += `╰───────────────\n\n`
        txt += `╭─「 🧠 *ESPECIFICACIONES* 」
`
        txt += `┃ 💾 \`ʀᴀᴍ\`: *${formatBytes(limits.memory)}*\n`
        txt += `┃ ⚡ \`ᴄᴘᴜ\`: *${limits.cpu === 0 ? 'Ilimitada' : limits.cpu + '%'}*\n`
        txt += `┃ 📦 \`ᴅɪsᴋ\`: *${formatBytes(limits.disk)}*\n`
        txt += `┃ 🔄 \`sᴡᴀᴘ\`: *${limits.swap} MB*\n`
        txt += `╰───────────────\n\n`
        txt += `╭─「 📦 *ꜰᴇᴀᴛᴜʀᴇ ʟɪᴍɪᴛs* 」\n`
        txt += `┃ 🗄️ \`ᴅᴀᴛᴀʙᴀsᴇ\`: *${features.databases}*\n`
        txt += `┃ 💾 \`ʙᴀᴄᴋᴜᴘ\`: *${features.backups}*\n`
        txt += `┃ 🔌 \`ᴀʟʟᴏᴄᴀᴛɪᴏɴs\`: *${features.allocations}*\n`
        txt += `╰───────────────`
        
        return m.reply(txt)
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
