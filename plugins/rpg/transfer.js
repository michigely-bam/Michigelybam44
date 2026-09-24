import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'transfer',
    alias: ['tf', 'kirim'],
    category: 'rpg',
    description: "Transferir dinero o artículos a otro usuario",
    usage: ".transfer <dinero/nombre_artículo> <cantidad> @usuario",
    example: '.transfer money 10000 @tag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const sender = db.getUser(m.sender)
    
    const args = m.args || []
    if (args.length < 3) {
        return m.reply(
            `💸 *ᴛʀᴀɴsꜰᴇʀ*\n\n` +
            `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
            `┃ > \`.transfer money 10000 @user\`\n` +
            `┃ > \`.transfer potion 5 @user\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    const type = args[0].toLowerCase()
    const amount = parseInt(args[1])
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!target) {
        return m.reply(`❌ *ᴛᴀʀɢᴇᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ*

> ¡Menciona al usuario destinatario!`)
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*

> ¡No puedes transferirte a ti mismo!`)
    }
    
    if (!amount || amount <= 0) {
        return m.reply(`❌ *ɪɴᴠᴀʟɪᴅ ᴀᴍᴏᴜɴᴛ*

¡El número debe ser superior a 0!`)
    }
    
    const recipient = db.getUser(target) || db.setUser(target)
    
    if (type === 'money' || type === 'balance') {
        if ((sender.koin || 0) < amount) {
            return m.reply(
                `❌ *saldo no es suficiente*

` +
                `> Tus monedas: Rp ${(sender.koin || 0).toLocaleString('id-ID')}\n` +
                `> Necesidad: Rp ${amount.toLocaleString('id-ID')}`
            )
        }
        
        sender.koin -= amount
        recipient.koin = (recipient.koin || 0) + amount
        
        db.setUser(m.sender, sender)
        db.setUser(target, recipient)
        db.save()
        return m.reply(`✅ *ᴛʀᴀɴsꜰᴇʀ COMPLETADO*

> 💸 Enviado: Rp ${amount.toLocaleString('id-ID')}
> 👤 Destinatario: @${target.split('@')[0]}`, { mentions: [target] })
    } else {
        sender.inventory = sender.inventory || {}
        recipient.inventory = recipient.inventory || {}
        
        if ((sender.inventory[type] || 0) < amount) {
            return m.reply(
                `❌ *OBJETOS INSUFICIENTES*\n\n` +
                `> Item *${type}* tú: ${sender.inventory[type] || 0}\n` +
                `> Necesita: ${amount}`
            )
        }
        
        sender.inventory[type] -= amount
        recipient.inventory[type] = (recipient.inventory[type] || 0) + amount
        
        db.setUser(m.sender, sender)
        db.setUser(target, recipient)
        db.save()
        return m.reply(`✅ *ᴛʀᴀɴsꜰᴇʀ COMPLETADO*\n\n> 📦 Item: ${type}
> 🔢 Cantidad: ${amount}
> 👤 Destinatario: @${target.split('@')[0]}`, { mentions: [target] })
    }
}

export { pluginConfig as config, handler }
