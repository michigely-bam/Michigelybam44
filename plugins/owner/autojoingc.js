import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'autojoingc',
    alias: ['autojoin', 'autojoingroup'],
    category: 'owner',
    description: 'Se une automáticamente a grupos mediante enlaces detectados en el chat',
    usage: '.autojoingc activar/desactivar',
    example: '.autojoingc activar',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}
const GROUP_LINK_REGEX = /chat\.whatsapp\.com\/([a-zA-Z0-9]{18,24})/gi
async function handler(m) {
    const db = getDatabase()
    const arg = (m.args?.[0] || '').toLowerCase()
    if (!arg || !['activar', 'desactivar'].includes(arg)) {
        const current = db.setting('autoJoinGc') || false
        return m.reply(`🔗 *UNIÓN AUTOMÁTICA A GRUPOS*\n\nEstado: *${current ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*\n\n\`${m.prefix}autojoingc activar\` — activar\n\`${m.prefix}autojoingc desactivar\` — desactivar`)
    }
    const enabled = arg === 'activar'
    db.setting('autoJoinGc', enabled)
    await db.save()
    m.reply(`${enabled ? '✅' : '❌'} Unión automática a grupos *${enabled ? 'activada' : 'desactivada'}*`)
}
async function autoJoinDetector(m, sock) {
    const db = getDatabase()
    if (!db?.ready) return false
    if (!db.setting('autoJoinGc')) return false
    if (!m.body) return false
    const matches = [...m.body.matchAll(GROUP_LINK_REGEX)]
    if (!matches.length) return false
    let joined = 0
    for (const match of matches) {
        const code = match[1]
        try {
            const result = await sock.groupAcceptInvite(code)
            if (result) {
                joined++
                await m.reply(`✅ Se unió correctamente al grupo mediante el enlace *${match[0]}*`)
            }
        } catch (e) {
            const msg = e.message || String(e)
            if (msg.includes('already') || msg.includes('participant')) {
                await m.reply(`⚠️ Ya está en ese grupo`)
            } else if (msg.includes('expired') || msg.includes('revoked')) {
                await m.reply(`❌ El enlace del grupo ha expirado o ha sido revocado`)
            } else {
                await m.reply(te(m.prefix, m.command, m.pushName))
            }
        }
    }
    return joined > 0
}
export { pluginConfig as config, handler, autoJoinDetector }
