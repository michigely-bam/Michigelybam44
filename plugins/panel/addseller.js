import config from '../../config.js'
import fs from 'fs'
import path from 'path'
import { isLid, lidToJid } from '../../src/lib/ourin-lid.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
const pluginConfig = {
    name: 'addseller',
    alias: ['addreseller', 'delseller', 'delreseller', 'listseller', 'listreseller'],
    category: 'panel',
    description: "Gestiona vendedores y revendedores del panel",
    usage: ".addseller @user o .delseller @user",
    example: '.addseller @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function cleanJid(jid) {
    if (!jid) return null
    if (isLid(jid)) jid = lidToJid(jid)
    return jid.includes('@') ? jid : jid + '@s.whatsapp.net'
}

function getNumber(jid) {
    const clean = cleanJid(jid)
    return clean ? clean.split('@')[0] : null
}

function hasAccess(senderJid, isOwner, pteroConfig) {
    if (isOwner) return true
    const cleanSender = cleanJid(senderJid)?.split('@')[0]
    if (!cleanSender) return false
    const ownerPanels = pteroConfig?.ownerPanels || []
    return ownerPanels.includes(cleanSender)
}

function saveConfig() {
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let content = fs.readFileSync(configPath, 'utf8')
        
        const sellersStr = JSON.stringify(config.pterodactyl.sellers || [])
        content = content.replace(
            /sellers:\s*\[.*?\]/s,
            `sellers: ${sellersStr}`
        )
        
        const ownerPanelsStr = JSON.stringify(config.pterodactyl.ownerPanels || [])
        content = content.replace(
            /ownerPanels:\s*\[.*?\]/s,
            `ownerPanels: ${ownerPanelsStr}`
        )
        
        fs.writeFileSync(configPath, content, 'utf8')
        return true
    } catch (e) {
        console.error('[Panel] No se pudo guardar la configuración:', e.message)
        return false
    }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const pteroConfig = config.pterodactyl
    
    if (!hasAccess(m.sender, m.isOwner, pteroConfig)) {
        return m.reply(`❌ *se rechazó el acceso*

> Esta característica es sólo para el Propietario o Panel de Propietario.`)
    }
    
    if (!pteroConfig) {
        return m.reply(`❌ Configuración de pterodactilo no encontrada en config.js`)
    }
    
    if (!pteroConfig.sellers) {
        pteroConfig.sellers = []
    }
    
    const isAdd = ['addseller', 'addreseller'].includes(cmd)
    const isDel = ['delseller', 'delreseller'].includes(cmd)
    const isList = ['listseller', 'listreseller'].includes(cmd)
    
    if (isList) {
        if (pteroConfig.sellers.length === 0) {
            return m.reply(`📋 *lista de vendedores/reseller*

> Todavía no hay vendedores registrados.`)
        }
        
        let txt = `📋 *lista de vendedores/reseller*

`
        txt += `> Total: *${pteroConfig.sellers.length}* seller\n\n`
        pteroConfig.sellers.forEach((s, i) => {
            txt += `${i + 1}. \`${s}\`\n`
        })
        txt += `
> _Vendedor podría crear servidor (1gb-10gb v1 / v2 / v3)_`
        return m.reply(txt)
    }
    
    let targetUser = null
    if (m.quoted?.sender) {
        targetUser = getNumber(m.quoted.sender)
    } else if (m.mentionedJid?.length > 0) {
        targetUser = getNumber(m.mentionedJid[0])
    } else if (m.text?.trim()) {
        targetUser = m.text.trim().replace(/[^0-9]/g, '')
    } else {
        targetUser = getNumber(m.sender)
    }
    
    if (!targetUser) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}${cmd} @user\`\n` +
            `> \`${m.prefix}${cmd} 628xxx\`\n` +
            `> Responder a los mensajes del usuario`
        )
    }
    
    if (isAdd) {
        if (pteroConfig.sellers.includes(targetUser)) {
            return m.reply(`❌ \`${targetUser}\` Ya es un vendedor.`)
        }
        
        let roleChanged = ''
        const ownerIdx = (pteroConfig.ownerPanels || []).indexOf(targetUser)
        if (ownerIdx !== -1) {
            pteroConfig.ownerPanels.splice(ownerIdx, 1)
            roleChanged = `
> ⚡ Auto-downgrade del Panel de Oferta al Vendedor`
        }
        
        pteroConfig.sellers.push(targetUser)
        
        if (saveConfig()) {
            m.react('✅')
            return m.reply(
                `✅ *vendedor añadido*

` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📱 NÚMERO: \`${targetUser}\`\n` +
                `┃ 🏷️ sᴛᴀᴛᴜs: \`Seller/Reseller\`\n` +
                `┃ 🔓 acceso: \`Create Server (1gb-10gb v1-v3)\`
` +
                `┃ 📊 ᴛᴏᴛᴀʟ: \`${pteroConfig.sellers.length}\` seller\n` +
                `╰┈┈⬡${roleChanged}`
            )
        } else {
            pteroConfig.sellers = pteroConfig.sellers.filter(s => s !== targetUser)
            return m.reply(`❌ Falló para salvar a config.js`)
        }
    }
    
    if (isDel) {
        if (!pteroConfig.sellers.includes(targetUser)) {
            return m.reply(`❌ \`${targetUser}\` No un vendedor.`)
        }
        
        pteroConfig.sellers = pteroConfig.sellers.filter(s => s !== targetUser)
        
        if (saveConfig()) {
            m.react('✅')
            return m.reply(
                `✅ *vendedor eliminado*

` +
                `> Número: \`${targetUser}\`\n` +
                `> Total: *${pteroConfig.sellers.length}* seller`
            )
        } else {
            return m.reply(`❌ Falló para salvar a config.js`)
        }
    }
}

export { pluginConfig as config, handler }
