const pluginConfig = {
    name: 'delete',
    alias: ['del', 'hapus', 'd'],
    category: 'group',
    description: "Suprímase el mensaje con respuesta",
    usage: ".delete (responde al mensaje)",
    example: '.delete',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply("⚠️ *Responder el mensaje para eliminar!*")
    }
    
    const quotedSender = m.quoted.sender || m.quoted.key?.participant
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const isOwnMessage = m.quoted.key?.fromMe || quotedSender === m.sender
    const isBotMessage = quotedSender === botJid || m.quoted.key?.fromMe
    
    if (!isOwnMessage && !isBotMessage) {
        if (!m.isBotAdmin) {
            return m.reply("⚠️ *Bot debe ser un administrador para eliminar los mensajes de otras personas!*")
        }
        if (!m.isAdmin && !m.isOwner) {
            return m.reply("⚠️ *¡Sólo el administrador puede borrar el mensaje de alguien más!*")
        }
    }
    
    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: quotedSender
        }
        
        await sock.sendMessage(m.chat, { delete: key })
        await m.react('✅')
        
    } catch (err) {
        if (err.message?.includes('not found') || err.message?.includes('forbidden')) {
            await m.reply("❌ *¡No se pudo delete!*\n> El mensaje puede haber sido borrado o hace demasiado tiempo.")
        } else {
            await m.react('❌')
        }
    }
}

export { pluginConfig as config, handler }
