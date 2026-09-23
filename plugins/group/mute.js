import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'mute',
    alias: ['bisukan'],
    category: 'group',
    description: "Insertar todos los grupos (sólo administración puede enviar mensajes)",
    usage: '.mute',
    example: '.mute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (group.mute) return m.reply("❌ El grupo ya está en un estado mudo.")

    db.setGroup(m.chat, { ...group, mute: true })
    m.reply(`✅ Grup *${groupName}* con éxito mudo por @${m.sender.split('@')[0]}

Sólo el administrador puede enviar un mensaje.
Ketik *${m.prefix}unmute* Para reabrir.`, { mentions: [m.sender] })
}

function isMuted(groupJid, db) {
    const group = db.getGroup(groupJid) || {}
    return !!group.mute
}

export { pluginConfig as config, handler, isMuted }