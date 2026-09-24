import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'cekonline',
    alias: ['checkonline', 'online', 'siapayangonline', 'whosonline'],
    category: 'group',
    description: "Chequeo de miembro en línea en grupo",
    usage: '.cekonline',
    example: '.cekonline',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🔍')
    
    try {
        const groupMetadata = m.groupMetadata
        const participants = m.groupMembers
        
        if (participants.length === 0) {
            m.react('❌')
            return m.reply(`❌ *falló*

> No podría obtener datos de miembros del grupo`)
        }
        
        await m.reply(`🔍 *BUSCANDO MIEMBROS EN LÍNEA...*

> Esperando la respuesta de ${participants.length} member
> Estimación: 5 a 10 segundos`)
        
        const presences = {}
        
        const presenceHandler = (update) => {
            if (update.id === m.chat && update.presences) {
                for (const [jid, presence] of Object.entries(update.presences)) {
                    if (presence.lastKnownPresence === 'available' || 
                        presence.lastKnownPresence === 'composing' || 
                        presence.lastKnownPresence === 'recording') {
                        presences[jid] = presence.lastKnownPresence
                    }
                }
            }
        }
        
        sock.ev.on('presence.update', presenceHandler)
        
        const batchSize = 10
        for (let i = 0; i < participants.length; i += batchSize) {
            const batch = participants.slice(i, i + batchSize)
            await Promise.all(batch.map(p => 
                sock.presenceSubscribe(p.id).catch(() => {})
            ))
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        sock.ev.off('presence.update', presenceHandler)
        
        const onlineMembers = Object.keys(presences)
        const mentions = onlineMembers
        
        let text = `📊 *COMPROBAR EN LÍNEA*\n\n`
        text += `╭┈┈⬡「 📋 *ɪɴꜰᴏ GRUPO* 」\n`
        text += `┃ 👥 NOMBRE: *${groupMetadata.subject}*\n`
        text += `┃ 👤 ᴛᴏᴛᴀʟ: \`${participants.length}\` member\n`
        text += `┃ 🟢 ᴏɴʟɪɴᴇ: \`${onlineMembers.length}\` member\n`
        text += `╰┈┈⬡\n\n`
        
        if (onlineMembers.length === 0) {
            text += `> _No hay miembros detectados en línea_
`
            text += `> _Asegúrate de que el miembro haya abierto WhatsApp_`
        } else {
            text += `╭┈┈⬡「 🟢 *ᴍᴇᴍʙᴇʀ ᴏɴʟɪɴᴇ* 」\n`
            
            let count = 0
            for (const jid of onlineMembers) {
                if (count >= 50) {
                    text += `┃ ...y ${onlineMembers.length - 50} miembros más
`
                    break
                }
                const number = jid.split('@')[0]
                const participant = participants.find(p => p.id === jid)
                const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
                const adminBadge = isAdmin ? ' 👑' : ''
                
                let statusIcon = '🟢'
                if (presences[jid] === 'composing') statusIcon = '⌨️'
                if (presences[jid] === 'recording') statusIcon = '🎤'
                
                text += `┃ ${statusIcon} @${number}${adminBadge}\n`
                count++
            }
            
            text += `╰┈┈⬡\n\n`
            text += `> 🟢 En línea | ⌨️ Escribiendo | 🎤 Grabando audio`
        }
        
        m.react('✅')
        await m.reply(text, { mentions: mentions })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
