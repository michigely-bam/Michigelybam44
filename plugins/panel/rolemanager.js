import { isLid, lidToJid } from '../../src/lib/ourin-lid.js'
import { addRole, removeRole, listByRole, canManageRole, getUserRole, VALID_SERVERS } from '../../src/lib/ourin-roles-cpanel.js'
const ROLES = ['owner', 'ceo', 'reseller']
const allCommands = []

ROLES.forEach(role => {
    VALID_SERVERS.forEach(ver => {
        allCommands.push(`add${role}${ver}`)
        allCommands.push(`del${role}${ver}`)
        allCommands.push(`list${role}${ver}`)
    })
})

const pluginConfig = {
    name: allCommands,
    alias: [],
    category: 'panel',
    description: "Gestiona propietarios, directores y revendedores por servidor",
    usage: ".addownerv1 @user o .listceov2",
    example: '.addresellerv1 @user',
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

function parseCommand(cmd) {
    const match = cmd.match(/^(add|del|list)(owner|ceo|reseller)(v[1-5])$/i)
    if (!match) return null
    return {
        action: match[1].toLowerCase(),
        role: match[2].toLowerCase(),
        server: match[3].toLowerCase()
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function handler(m, { sock }) {
    const parsed = parseCommand(m.command)
    if (!parsed) {
        return m.reply(`❌ Comando inválido.`)
    }
    
    const { action, role, server } = parsed
    const serverLabel = server.toUpperCase()
    const roleLabel = capitalize(role)
    
    if (action === 'list') {
        const list = listByRole(server, role)
        if (list.length === 0) {
            return m.reply(`📋 *LISTA ${roleLabel.toUpperCase()} ${serverLabel}*

> Nada todavía. ${role} registrado.`)
        }
        
        let txt = `📋 *LISTA ${roleLabel.toUpperCase()} ${serverLabel}*\n\n`
        txt += `> Total: *${list.length}* ${role}\n\n`
        list.forEach((num, i) => {
            txt += `${i + 1}. \`${num}\`\n`
        })
        txt += `\n> _Role: ${roleLabel} | Server: ${serverLabel}_`
        return m.reply(txt)
    }
    
    if (!canManageRole(m.sender, server, role, m.isOwner)) {
        const userRole = getUserRole(m.sender, server)
        return m.reply(
            `❌ *se rechazó el acceso*

` +
            `No puedes manejar.${roleLabel}* en *${serverLabel}*\n` +
            `> Tu rol: *${userRole ? capitalize(userRole) : "No hay"}*\n\n` +
            `> Jerarquía: Propietario > Director > Revendedor`
        )
    }
    
    let targetUser = null
    if (m.quoted?.sender) {
        targetUser = getNumber(m.quoted.sender)
    } else if (m.mentionedJid?.length > 0) {
        targetUser = getNumber(m.mentionedJid[0])
    } else if (m.text?.trim()) {
        targetUser = m.text.trim().replace(/[^0-9]/g, '')
    }
    
    if (!targetUser) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}${m.command} @user\`\n` +
            `> \`${m.prefix}${m.command} 628xxx\`\n` +
            `> Responder a los mensajes del usuario`
        )
    }
    
    if (action === 'add') {
        const result = addRole(targetUser, server, role)
        if (!result.success) {
            return m.reply(`❌ *ERROR*\n\n> ${result.error}`)
        }
        
        m.react('✅')
        return m.reply(
            `✅ *${roleLabel.toUpperCase()} AÑADIDO*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📱 NÚMERO: \`${targetUser}\`\n` +
            `┃ 🏷️ ʀᴏʟᴇ: \`${roleLabel}\`\n` +
            `┃ 🖥️ sᴇʀᴠᴇʀ: \`${serverLabel}\`\n` +
            `┃ 📊 ᴛᴏᴛᴀʟ: \`${listByRole(server, role).length}\` ${role}\n` +
            `╰┈┈⬡`
        )
    }
    
    if (action === 'del') {
        const result = removeRole(targetUser, server, role)
        if (!result.success) {
            return m.reply(`❌ *ERROR*\n\n> ${result.error}`)
        }
        
        m.react('✅')
        return m.reply(
            `✅ *${roleLabel.toUpperCase()} eliminado*

` +
            `> Número: \`${targetUser}\`\n` +
            `> Server: *${serverLabel}*\n` +
            `> Total: *${listByRole(server, role).length}* ${role}`
        )
    }
}

export { pluginConfig as config, handler }
