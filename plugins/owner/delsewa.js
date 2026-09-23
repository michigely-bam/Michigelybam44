import { getDatabase } from '../../src/lib/ourin-database.js'
import fs from 'fs'
const pluginConfig = {
    name: 'delsewa',
    alias: ['sewadel', 'hapussewa', 'removesewa'],
    category: 'owner',
    description: "Quitar grupo de la lista blanca de alquiler",
    usage: ".deltur - enlace / grupo id √",
    example: '.delsewa https://chat.whatsapp.com/xxx',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function resolveGroupId(sock, input) {
    if (input.includes('chat.whatsapp.com/')) {
        const inviteCode = input.split('chat.whatsapp.com/')[1]?.split(/[\s?]/)[0]
        try {
            const metadata = await sock.groupGetInviteInfo(inviteCode)
            if (metadata?.id) return { id: metadata.id, name: metadata.subject }
        } catch {}
        return null
    }
    return { id: input.includes('@g.us') ? input : input + '@g.us', name: null }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const input = m.text?.trim()

    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    let groupId = null
    let groupName = null

    if (!input) {
        if (!m.isGroup) {
            return m.reply(
                `📝 *HAPUS SEWA*\n\n` +
                `Dari private: *${m.prefix}delsewa <link/id>*\n` +
                `Dari grup: ketik *${m.prefix}delsewa* langsung di grup\n\n` +
                `Contoh:\n` +
                `• ${m.prefix}delsewa https://chat.whatsapp.com/xxx\n` +
                `• ${m.prefix}delsewa 120363xxx\n\n` +
                `⚠️ Jika sewabot aktif, bot akan otomatis keluar dari grup yang dihapus`
            )
        }
        groupId = m.chat
    } else {
        const result = await resolveGroupId(sock, input)
        if (!result) return m.reply(`❌ Enlace inválido o grupo no encontrado`)
        groupId = result.id
        groupName = result.name
    }

    if (!groupId) return m.reply(`❌ Incapaz de determinar el grupo`)

    const sewaData = db.db.data.sewa.groups[groupId]
    if (!sewaData) return m.reply(`❌ El grupo no figura en el sistema de alquileres

Ver lista: *${m.prefix}listsewa*`)

    groupName = groupName || sewaData.name || groupId.split('@')[0]

    delete db.db.data.sewa.groups[groupId]
    db.db.write()

    await m.react('✅')
    await m.reply(`✅ *MANAS DE RENT*

Grup: *${groupName}*\nID: ${groupId.split('@')[0]}`)

    if (db.db.data.sewa.enabled) {
        try {
            await sock.sendText(groupId, `⛔ Este grupo ha sido eliminado de la lista blanca de alquiler.
La bota dejará el grupo.

Llame al dueño para un renombrado.`, null, {
                contextInfo: {
                    forwardingScore: 99,
                    isForwarded: true,
                    externalAdReply: {
                        mediaType: 1,
                        title: "MANAS DE RENT",
                        body: "Grupo eliminado de la lista blanca",
                        thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                        renderLargerThumbnail: true
                    }
                }
            })
            await new Promise(r => setTimeout(r, 2000))
            await sock.groupLeave(groupId)
        } catch {}
    }
}

export { pluginConfig as config, handler }