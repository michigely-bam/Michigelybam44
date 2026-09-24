import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: "Establecer automáticamente / activadores inteligentes por grupo",
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

const AUTOREPLY_MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media')

if (!fs.existsSync(AUTOREPLY_MEDIA_DIR)) {
    fs.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true })
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    const privateAutoreply = db.setting('autoreplyPrivate') ?? false
    
    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(`❌ *falló*

> ¡Sólo el propietario puede gestionar de forma privada!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        
        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true)
            m.react('✅')
            return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴛᴇ ACTIVADO*

> Bot responderá automáticamente en chat privado`)
        }
        
        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false)
            m.react('❌')
            return m.reply(`❌ *autoreply private se ha desactivado*

> Bot no responderá automáticamente en chat privado`)
        }
        
        const currentStatus = db.setting('autoreplyPrivate') ?? false
        return m.reply(
            `📱 *AUTOREPLY PRIVATE*\n\n` +
            `Status: *${currentStatus ? "✅ ACTIVO" : "❌ INACTIVO"}*\n\n` +
            `*LAS ÓRDENES ESTÁN DISPONIBLES:*
` +
            `• *${m.prefix}autoreply private on* — Activar el privado
` +
            `• *${m.prefix}autoreply private off* — Desactiva el privado`
        )
    }
    
    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(`❌ *falló*

> ¡Sólo los propietarios pueden manejar el mundo de forma autorírica!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        const globalCustomReplies = db.setting('globalCustomReplies') || []
        
        if (subAction === 'add') {
            const fullBody = m.body || ''
            const pipeIdx = fullBody.indexOf('|')
            if (pipeIdx === -1) {
                return m.reply(
                    `❌ *formato erróneo*

` +
                    `> Utilice el formato: \`trigger|Responde\`

` +
                    `> Ejemplo:\n` +
                    `> \`${m.prefix}autoreply global add halo|Hola {name}!\``
                )
            }
            
            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length
            const triggerEnd = pipeIdx
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim()
            const reply = fullBody.substring(pipeIdx + 1)
            
            if (!trigger.trim() || !reply) {
                return m.reply(`❌ *falló*

> ¡El truco y la respuesta no deben estar vacíos!`)
            }
            
            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase())
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply })
            }
            
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('✅')
            return m.reply(
                `✅ *GLOBAL AUTOREPLY AÑADIDO*

` +
                `• Trigger: *${trigger.trim()}*\n` +
                `• Total: *${globalCustomReplies.length}* replies\n\n` +
                `_Activo en todos los grupos y chats privados_`
            )
        }
        
        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim()
            if (!trigger) {
                return m.reply(`❌ *falló*

> ¡Introduzca el gatillo para eliminar!`)
            }
            
            const index = globalCustomReplies.findIndex(r => r.trigger === trigger)
            if (index === -1) {
                return m.reply(`❌ *falló*

> Trigger \`${trigger}\` ¡No lo encontraron!`)
            }
            
            globalCustomReplies.splice(index, 1)
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('🗑️')
            return m.reply(`🗑️ *GLOBAL AUTOREPLY BORRAR*

Trigger *${trigger}* ¡Se ha borrado!`)
        }
        
        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `📋 *GLOBAL AUTOREPLY*\n\n` +
                    `Estatus: *❌ NO hay datos*

` +
                    `*LAS ÓRDENES ESTÁN DISPONIBLES:*
` +
                    `• *${m.prefix}autoreply global add <trigger>|<reply>*`
                )
            }
            
            let text = `📋 *GLOBAL AUTOREPLY*\n\n`
            text += `Total: *${globalCustomReplies.length}* replies\n`
            text += `Se aplica en: *Todos los grupos y chats privados*

`
            text += `*TRIGGER DAR:*
`
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `${i + 1}. *${r.trigger}* ${hasImage}\n   ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n\n`
            })
            return m.reply(text.trim())
        }
        
        return m.reply(
            `📱 *ɢʟᴏʙᴀʟ ᴀᴜᴛᴏʀᴇᴘʟʏ*\n\n` +
            `> \`${m.prefix}autoreply global add trigger|reply\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\``
        )
    }
    
    if (!m.isGroup) {
        return m.reply(
            `📱 *SISTEMA DE RESPUESTAS AUTOMÁTICAS*

` +
            `Autoreply Private: *${privateAutoreply ? "✅ ACTIVO" : "❌ INACTIVO"}*\n\n` +
            `*LAS ÓRDENES ESTÁN DISPONIBLES:*
` +
            `• *${m.prefix}autoreply private on/off* — Toggle private\n` +
            `• *${m.prefix}autoreply global add/del/list* — Global triggers\n\n` +
            `_Nota: Para la configuración de autoreply grupo, use este comando dentro del grupo._`
        )
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ *falló*

> ¡Sólo el administrador puede manejarlo de forma automática en el grupo!`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const globalSmartTriggers = db.setting('smartTriggers') ?? config.features?.smartTriggers ?? false
    
    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply
        const effectiveStatus = groupStatus ?? globalSmartTriggers
        const customReplies = groupData.customReplies || []
        
        let text = `🤖 *SISTEMA DE RESPUESTAS AUTOMÁTICAS DEL GRUPO*

`
        text += `Status Global: *${globalSmartTriggers ? "✅ ACTIVO" : "❌ INACTIVO"}*\n`
        text += `Situación actual del Grupo: *${groupStatus === undefined ? 'DEFAULT' : (groupStatus ? "✅ ACTIVO" : "❌ INACTIVO")}*\n`
        text += `Status Private: *${privateAutoreply ? "✅ ACTIVO" : "❌ INACTIVO"}*\n`
        text += `Effective in Group: *${effectiveStatus ? "✅ ACTIVO" : "❌ INACTIVO"}*\n`
        text += `Total Custom Reply (Group): *${customReplies.length}*\n\n`
        text += `*GESTIÓN DEL GRUPO:*
`
        text += `• *${m.prefix}autoreply on* - Activar en este grupo
`
        text += `• *${m.prefix}autoreply off* - Desactivar en este grupo
`
        text += `• *${m.prefix}autoreply add <trigger>|<reply>* - Añadir respuesta personalizada
`
        text += `• *${m.prefix}autoreply del <trigger>* - Eliminar la respuesta personalizada
`
        text += `• *${m.prefix}autoreply list* - Ver todos los gatillos de este grupo.
`
        text += `• *${m.prefix}autoreply reset* - Eliminar TODAS las personalizados en este grupo

`
        
        if (m.isOwner) {
            text += `*GESTIÓN GLOBAL (PROPIETARIO):*
`
            text += `• *${m.prefix}autoreply global add <trigger>|<reply>*\n`
            text += `• *${m.prefix}autoreply global del <trigger>*\n`
            text += `• *${m.prefix}autoreply global list* - El desencadenante está activo.
`
            text += `• *${m.prefix}autoreply private on/off* — Activar o desactivar respuestas del bot en mensajes privados

`
        }
        
        text += `*FORMAS DE AÑADIR IMÁGENES:*
`
        text += `1. Enviar imagen junto con la leyenda: *${m.prefix}autoreply add trigger|reply*\n`
        text += `O responder fotos con: *${m.prefix}autoreply add trigger|reply*\n\n`
        text += `*Puede usar PLACEHOLDER:*
`
        text += `{name} • {tag} • {sender} • {botname} • {time} • {date}`
        
        return m.reply(text)
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true })
        m.react('✅')
        return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ACTIVADO*

> El Bot responderá automáticamente a este grupo`)
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false })
        m.react('❌')
        return m.reply(`❌ *autoreply desactivado*

> Bot no responderá automáticamente en este grupo`)
    }
    
    if (action === 'add') {
        const fullBody = m.body || ''
        const pipeIdx = fullBody.indexOf('|')
        
        if (pipeIdx === -1) {
            return m.reply(
                `❌ *FORMATO ERRÓNEO*

` +
                `Utilice el formato: *trigger

` +
                `*Text Only:*\n` +
                `• ${m.prefix}ar add halo|Hola {name}! 👋

` +
                `*Con imagen:*
` +
                `1. Responda a las imágenes ${m.prefix}ar add trigger|caption\n` +
                `2. Envíe imágenes + captura ${m.prefix}ar add trigger|caption\n\n` +
                `*Placeholder:*\n` +
                `• {name} - Nombre de usuario
` +
                `• {tag} - Tag @user\n` +
                `• {sender} - Número de usuario
` +
                `- El nombre del bot
` +
                `• {time} - El tiempo ahora
` +
                `• {date} - Date ahora`
            )
        }
        
        const addIdx = fullBody.toLowerCase().indexOf('add ')
        const triggerStart = addIdx + 'add '.length
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim()
        const reply = fullBody.substring(pipeIdx + 1)
        
        if (!trigger) {
            return m.reply(`❌ *falló*

> ¡El desencadenante no debe estar vacío!`)
        }
        
        let imageBuffer = null
        let imagePath = null
        
        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image')
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image'
        
        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download()
            } catch (e) {
                console.error('[Autoreply] No se pudo descargar la imagen citada:', e.message)
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download()
            } catch (e) {
                console.error('[Autoreply] No se pudo descargar la imagen directa:', e.message)
            }
        }
        
        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`
            imagePath = path.join(AUTOREPLY_MEDIA_DIR, filename)
            fs.writeFileSync(imagePath, imageBuffer)
        }
        
        const customReplies = groupData.customReplies || []
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())
        
        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        }
        
        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (fs.existsSync(customReplies[existingIndex].image)) {
                        fs.unlinkSync(customReplies[existingIndex].image)
                    }
                } catch {}
            }
            customReplies[existingIndex] = replyData
        } else {
            customReplies.push(replyData)
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('✅')
        
        let successMsg = `✅ *AUTOREPLY AÑADIDO*

`
        successMsg += `*DETAIL:*\n`
        successMsg += `• Trigger: *${trigger.trim()}*\n`
        if (reply) {
            successMsg += `• Reply: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\n`
        }
        if (imagePath) {
            successMsg += `• Imagen: ✅ Guardada
`
        }
        successMsg += `\nTotal: *${customReplies.length}* respuestas a este grupo`
        
        return m.reply(successMsg)
    }
    
    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim()
        
        if (!trigger) {
            return m.reply(`❌ *falló*

> ¡Introduzca el gatillo para eliminar!

\`${m.prefix}autoreply del halo\``)
        }
        
        const customReplies = groupData.customReplies || []
        const index = customReplies.findIndex(r => r.trigger === trigger)
        
        if (index === -1) {
            return m.reply(`❌ *falló*

> Trigger \`${trigger}\` ¡No lo encontraron!`)
        }
        
        if (customReplies[index].image) {
            try {
                if (fs.existsSync(customReplies[index].image)) {
                    fs.unlinkSync(customReplies[index].image)
                }
            } catch {}
        }
        
        customReplies.splice(index, 1)
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('🗑️')
        return m.reply(
            `🗑️ *AUTOREPLY ELIMINADO*

` +
            `El disparador *${trigger}* fue eliminado.
` +
            `Restante: *${customReplies.length}* replies`
        )
    }
    
    if (action === 'list') {
        const customReplies = groupData.customReplies || []
        
        const defaultTriggers = [
            { trigger: '@mention', reply: "👋 ¿Alguien me llama bot?" },
            { trigger: 'p', reply: "💬 ¡Acostúmbrate a saludar antes de conversar!" },
            { trigger: 'bot / ourin', reply: "🤖 ¡Adelante y en marcha!" },
            { trigger: 'assalamualaikum', reply: 'Wa alaikum assalam, hermano' }
        ]
        
        let text = `📋 *SIGN OUTOREPLY GRUPP*

`
        
        text += `*DEFAULT TRIGGERS:*\n`
        defaultTriggers.forEach((r, i) => {
            text += `• *${r.trigger}*\n`
            text += `  ↳ ${r.reply}\n`
        })
        text += `\n`
        
        if (customReplies.length > 0) {
            text += `*CUSTOM TRIGGERS:*\n`
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `• *${r.trigger}* ${hasImage}\n`
                if (r.reply) {
                    text += `  ↳ ${r.reply.substring(0, 35)}${r.reply.length > 35 ? '...' : ''}\n`
                }
            })
            text += `\n`
        } else {
            text += `*CUSTOM TRIGGERS:*\n`
            text += `_No hay activador personalizado en este grupo todavía_

`
        }
        
        text += `_Nota: No se pueden editar los defectos incorporados de los disparadores de bot._`
        
        return m.reply(text)
    }
    
    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || []
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (fs.existsSync(r.image)) fs.unlinkSync(r.image)
                } catch {}
            }
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies: [] })
        m.react('🗑️')
        return m.reply(`🗑️ *ᴀᴜᴛᴏʀᴇᴘʟʏ RESTABLECIDO*

> ¡Todas las personalizados!`)
    }
    
    return m.reply(`❌ *action no es válido*

> Utilice: \`on\`, \`off\`, \`private on/off\`, \`add\`, \`del\`, \`list\`, \`reset\``)
}

export { pluginConfig as config, handler }
