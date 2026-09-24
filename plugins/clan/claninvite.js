import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'claninvite',
    alias: ['inviteclan'],
    category: 'clan',
    description: 'Invitar y agregar directamente a un usuario al clan',
    usage: '.claninvite @user',
    example: '.claninvite @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user?.clanId) return m.reply(`❌ Aún no tienes un clan.`)
    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[user.clanId]
    if (!clan) return m.reply(`❌ Clan not found`)

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) {
        return m.reply(
            `📨 *CLAN INVITE*\n\n` +
            `Tag o respuesta de los usuarios que deseen ser invitados

` +
            `Ejemplo: *.claninvite @user*`
        )
    }

    if (target === m.sender) return m.reply(`❌ No puedes invitarte.`)

    const targetUser = db.getUser(target)
    if (targetUser?.clanId) return m.reply(`❌ El usuario ya tiene un clan`)
    if (clan.members.length >= 50) return m.reply(`❌ El clan está lleno (50 / 50)`)

    clan.members.push(target)
    db.setUser(target, { clanId: user.clanId })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *INVITED!*\n\n` +
        `@${target.split('@')[0]} se unió a *${clan.name}*\n` +
        `Members: ${clan.members.length}/50`,
        { mentions: [m.sender, target] }
    )
}

export { pluginConfig as config, handler }
