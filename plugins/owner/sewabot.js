import { getDatabase } from '../../src/lib/ourin-database.js'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'sewabot',
    alias: ['sewa'],
    category: 'owner',
    description: "Toggle and manage the rent-bot system",
    usage: '.sewabot <on/off/leave/status>',
    example: '.sewabot on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}
const pendingConfirmations = new Map()
async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.text?.trim()?.toLowerCase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }
    const currentStatus = db.db.data.sewa.enabled
    const sewaGroups = Object.keys(db.db.data.sewa.groups || {})
    if (!args || args === 'status') {
        return m.reply(
            `🔧 *SISTEMA DE ALQUILER DEL BOT*

` +
            `Status: *${currentStatus ? "✅ ACTIVO" : "❌ INACTIVO"}*\n` +
            `Grupos registrados: *${sewaGroups.length}*\n\n` +
            `*LAS ÓRDENES ESTÁN DISPONIBLES:*
` +
            `• *${m.prefix}sewabot on* — Activar el sistema de alquiler
` +
            `• *${m.prefix}sewabot off* — Desactivar el sistema de alquiler
` +
            `• *${m.prefix}sewabot leave* — Salir de todos los grupos no autorizados

` +
            `*GESTIONAR ALQUILER:*
` +
            `• *${m.prefix}addsewa <enlace> <duración>* — Agregar el grupo y unirse automáticamente
` +
            `• *${m.prefix}delsewa <enlace/id>* — Eliminar el grupo de la lista autorizada
` +
            `• *${m.prefix}renewsewa <enlace/id> <duración>* — Extender el alquiler
` +
            `• *${m.prefix}listsewa* — Ver todos los grupos registrados
` +
            `• *${m.prefix}checksewa* — Consultar el tiempo de alquiler restante (en el grupo)

` +
            `*FORMATO DE DURACIÓN:*
` +
            `30i (minutos) • 12h (horas) • 7d (días) • 1m (mes) • 1y (año) • lifetime (permanente)

` +
            `*CÓMO FUNCIONA:*
` +
            `1. Agrega el grupo con *${m.prefix}addsewa*\n` +
            `2. El bot se une automáticamente si usas un enlace
` +
            `3. Activa el sistema con *${m.prefix}sewabot on*\n` +
            `4. El bot saldrá de todos los grupos no registrados
` +
            `5. Cuando venza el alquiler, el bot saldrá del grupo automáticamente.`
        )
    }
    if (args === 'off') {
        db.db.data.sewa.enabled = false
        db.db.write()
        await m.react('✅')
        return m.reply(`✅ Sistema de alquiler desactivado

El Bot no dejará ningún grupo.`)
    }
    if (args === 'on') {
        const pending = pendingConfirmations.get(m.sender)
        if (pending && pending.type === 'sewabot_on' && Date.now() - pending.timestamp < 60000) {
            return m.reply(`🕕 Ya hay una solicitud de activación pendiente.

Escribe *${m.prefix}sewabot confirm* para continuar
Escribe *${m.prefix}sewabot cancel* para cancelar`)
        }
        pendingConfirmations.set(m.sender, { type: 'sewabot_on', timestamp: Date.now() })
        setTimeout(() => {
            if (pendingConfirmations.get(m.sender)?.type === 'sewabot_on') pendingConfirmations.delete(m.sender)
        }, 60000)
        return m.reply(
            `⚠️ *CONFIRMACIÓN DE ACTIVACIÓN DEL ALQUILER*

` +
            `Si se activa:
` +
            `• ✅ Los grupos autorizados permanecerán conectados.
` +
            `• ¡Todos los demás grupos serán abandonados!

` +
            `Escribe *${m.prefix}sewabot confirm* para continuar
Escribe *${m.prefix}sewabot cancel* para cancelar

` +
            `💡 Asegúrate de registrar los grupos importantes con:
*${m.prefix}addsewa <enlace del grupo> <duración>*`
        )
    }
    if (args === 'confirm' || args === 'yes' || args === 'y') {
        const pending = pendingConfirmations.get(m.sender)
        if (!pending || pending.type !== 'sewabot_on') {
            return m.reply(`❌ No hay ninguna solicitud de activación pendiente.
Escribe *${m.prefix}sewabot on* primero`)
        }
        pendingConfirmations.delete(m.sender)
        db.db.data.sewa.enabled = true
        db.db.write()
        await m.react('🕕')
        await m.reply(`🕕 El sistema de alquiler está activado, procesamiento de autoleave...`)
        try {
            global.isFetchingGroups = true
            const allGroups = await sock.groupFetchAllParticipating()
            global.isFetchingGroups = false
            const allGroupIds = Object.keys(allGroups)
            const unlistedGroups = allGroupIds.filter(id => !sewaGroups.includes(id))
            let leftCount = 0
            let failedCount = 0
            for (const groupId of unlistedGroups) {
                try {
                    await sock.sendText(groupId, `⛔ Este grupo no está incluido en el sistema de alquileres.
Bot dejará este grupo.

Llame al propietario para el bot de alquiler.`, null, {
                        contextInfo: {
                            forwardingScore: 99,
                            isForwarded: true,
                            externalAdReply: {
                                mediaType: 1,
                                title: "ALQUILER DEL BOT",
                                body: "Grupo no incluido",
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                renderLargerThumbnail: true
                            }
                        }
                    })
                    await new Promise(r => setTimeout(r, 2000))
                    await sock.groupLeave(groupId)
                    leftCount++
                    await new Promise(r => setTimeout(r, 3000))
                } catch {
                    failedCount++
                }
            }
            await m.react('✅')
            return m.reply(
                `✅ *ALQUILER DE BOT ACTIVOS*

` +
                `Grupo whitelist: *${sewaGroups.length}*\n` +
                `Salió de: *${leftCount}* grupo
` +
                `Falló: *${failedCount}* grupo`
            )
        } catch (e) {
            await m.react('✅')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
    if (args === 'leave') {
        if (!currentStatus) return m.reply(`❌ Activar la primera carga con *${m.prefix}sewabot on*`)
        await m.react('🕕')
        await m.reply(`🕕 Lista de grupos de recuperación...`)
        global.sewaLeaving = true
        try {
            global.isFetchingGroups = true
            const allGroups = await sock.groupFetchAllParticipating()
            global.isFetchingGroups = false
            const allGroupIds = Object.keys(allGroups)
            const unlistedGroups = allGroupIds.filter(id => !sewaGroups.includes(id))
            if (unlistedGroups.length === 0) {
                delete global.sewaLeaving
                await m.react('✅')
                return m.reply(`✅ Ningún grupo necesita ser dejado`)
            }
            await m.reply(`📊 Total: ${allGroupIds.length} grupo
Whitelist: ${sewaGroups.length}
Saliendo de: ${unlistedGroups.length} grupo`)
            let leftCount = 0
            let failedCount = 0
            for (const groupId of unlistedGroups) {
                try {
                    await sock.sendText(groupId, `👋 Este grupo no está incluido en el sistema de alquileres.
Bot dejará este grupo.

Llame al propietario para el bot de alquiler.`, null, {
                        contextInfo: {
                            forwardingScore: 99,
                            isForwarded: true,
                            externalAdReply: {
                                mediaType: 1,
                                title: "ALQUILER DEL BOT",
                                body: "Grupo no incluido",
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                renderLargerThumbnail: true
                            }
                        }
                    })
                    await new Promise(r => setTimeout(r, 3000))
                    await sock.groupLeave(groupId)
                    leftCount++
                    await new Promise(r => setTimeout(r, 5000))
                } catch {
                    failedCount++
                }
            }
            delete global.sewaLeaving
            await m.react('✅')
            return m.reply(`✅ Terminado

Salió: *${leftCount}* grupo
Falló: *${failedCount}* grupo`)
        } catch (e) {
            delete global.sewaLeaving
            await m.react('☢')
            await m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
    if (args === 'cancel' || args === 'no' || args === 'n') {
        const pending = pendingConfirmations.get(m.sender)
        if (!pending || pending.type !== 'sewabot_on') return m.reply(`❌ No hay solicitud de impugnación`)
        pendingConfirmations.delete(m.sender)
        await m.react('❌')
        return m.reply(`❌ Activación cancelada
Grupo blanco primero con *${m.prefix}addsewa*`)
    }
    return m.reply(`❌ Comando inválido

Escribe *${m.prefix}sewabot* para ver la guía completa`)
}
export { pluginConfig as config, handler, pendingConfirmations }
