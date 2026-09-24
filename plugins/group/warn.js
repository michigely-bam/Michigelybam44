import { getDatabase } from '../../src/lib/ourin-database.js'
import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'peringatan'],
    category: 'group',
    description: "Alerta a los miembros",
    usage: '.warn @usuario <motivo>',
    example: '.warn @user spam',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `⚠️ *SISTEMA DE ADVERTENCIA DE GRUPO*

` +
            `Un sistema de gestión de infracciones para los miembros del grupo.
` +
            `Limites de advertencia: *${maxWarns} veces* (expulsión automática)

` +
            `*USO:*
` +
            `• *${m.prefix}warn @usuario <motivo>* — Advertir a un miembro
` +
            `• *${m.prefix}warn max <número>* — Cambiar el límite máximo de la advertencia
` +
            `• *${m.prefix}listwarn* — Ver la lista de miembros con problemas
` +
            `• *${m.prefix}resetwarn @user* — Eliminar todos los miembros de la advertencia

` +
            `*EXPLICACIÓN DEL CIRCUITO DE USO:*
` +
            `1. Cuando el miembro cometa su primera infracción, déle SP1: *${m.prefix}warn @user Spam de mensajes *
` +
            `2. Los bots registrarán los mensajes de spam como su primera advertencia.
` +
            `3. Si vuelve a incumplir, advierta por segunda vez con un nuevo motivo:${m.prefix}warn @user Lenguaje ofensivo*
` +
            `4. Si el total de las alertas de los miembros alcanza el límite máximo (actualmente *${maxWarns}*), el bot automáticamente lanzará (Kick) a ese miembro.
` +
            `5. El historial del delito se puede ver completo escribiendo *${m.prefix}listwarn @user*.`
        )
    }
    if (args[0]?.toLowerCase() === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(`❌ *FALLÓ*

El límite de referencia de la advertencia debe ser de 1 a 20.
Ejemplo: *${m.prefix}warn max 5*`)
        }
        groupData.maxWarnings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(`✅ *LOS LÍMITES DE ADVERTENCIA FUERON MODIFICADOS*

La advertencia máxima de este grupo ha sido actualizada *${newMax} kali*.`)
    }

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *MODO DE USO*

` +
            `> Responde al mensaje del usuario con \`${m.prefix}warn motivo\`\n` +
            `> O usa: \`${m.prefix}warn @usuario motivo\``
        )
        return
    }
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === targetUser)
        if (participant?.admin) {
            await m.reply(`❌ No puedo dar aviso al administrador del grupo.`)
            return
        }
    } catch (e) {}
    
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetUser === botJid) {
        await m.reply(`❌ No me adviertas, solo soy un bot.`)
        return
    }
    
    const reasonArg = m.quoted ? m.text?.trim() : m.text?.replace(/@\d+/g, '').replace(/^\s*warn\s*/i, '').trim()
    const reason = reasonArg || "No hay razón"
    
    let userWarnings = warnings[targetUser] || []
    userWarnings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })
    
    warnings[targetUser] = userWarnings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    const warnCount = userWarnings.length
    const targetName = targetUser.split('@')[0]
    
    if (warnCount >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
            await m.reply(
                `🚨 *MÁXIMO DE ADVERTENCIAS ALCANZADO*

` +
                `@${targetName} ¡Ha sido expulsado del grupo por haber alcanzado el límite del delito!

` +
                `*Detalles:*
` +
                `> Warning: *${warnCount}/${maxWarns}*\n` +
                `> Último motivo: *${reason}*`,
                { mentions: [targetUser] }
            )
            delete warnings[targetUser]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `⚠️ *SE DIO UN AVISO*

` +
            `@${targetName} ha recibido una carta de advertencia (SP${warnCount})!\n\n` +
            `*Detalles:*
` +
            `Advertencia a: *${warnCount}/${maxWarns}*\n` +
            `> Motivo: *${reason}*\n\n` +
            `_${maxWarns - warnCount} advertencia otra vez = KICK OUTOMATIS`,
            { mentions: [targetUser] }
        )
    }
}

export { pluginConfig as config, handler }
