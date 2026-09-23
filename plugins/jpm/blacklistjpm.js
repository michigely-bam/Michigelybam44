import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'blacklistjpm',
    alias: ['bljpm', 'jpmbl', 'jpmblacklist', 'listblacklistjpm'],
    category: 'jpm',
    description: "Grupo de lista negra de JPM con número de secuencia",
    usage: ".bljpm [número]",
    example: '.bljpm 2 3 7',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let blacklist = db.setting('jpmBlacklist') || []
    const allGroups = await sock.groupFetchAllParticipating()
    const groups = Object.values(allGroups).sort((a, b) => a.subject.localeCompare(b.subject))
    if (!m.text) {
        if (groups.length === 0) {
            return m.reply(`❌ La bota aún no está en ningún grupo.`)
        }
        let listText = `📋 *LIGHT GRUPP &amp; JPM BLACKLIST*

`
        listText += `A continuación *${groups.length} grup* El que fue seguido por el bot ${config.bot?.name}\n`
        listText += `Tanda *(🚫)* significa que el grupo está en lista negra.

`
        for (let i = 0; i < groups.length; i++) {
            const isBlacklisted = blacklist.includes(groups[i].id)
            const icon = isBlacklisted ? ' 🚫' : ''
            listText += `*${i + 1}.* ${groups[i].subject}${icon}\n`
        }
        listText += `\n*CARA BLACKLIST / UN-BLACKLIST:*\n`
        listText += `Tipo comando seguido por número de grupo para cambiar (puede ser más de uno, separado por espacio).

`
        listText += `*Contoh:*\n`
        listText += `> \`${m.prefix}bljpm 2 3 7\``
        return m.reply(listText)
    }
    const args = m.text.trim().split(/\s+/)
    const toggled = []
    for (const numStr of args) {
        const num = parseInt(numStr)
        if (!isNaN(num) && num > 0 && num <= groups.length) {
            const index = num - 1
            const targetGroup = groups[index]
            if (blacklist.includes(targetGroup.id)) {
                blacklist = blacklist.filter(jid => jid !== targetGroup.id)
                toggled.push(`*${num}.* ${targetGroup.subject} ✅ *(Di-Unblacklist)*`)
            } else {
                blacklist.push(targetGroup.id)
                toggled.push(`*${num}.* ${targetGroup.subject} 🚫 ~(Di-Blacklist)~`)
            }
        }
    }

    if (toggled.length === 0) {
        return m.reply(`❌ No hay número de grupo válido.

Ketik *${m.prefix}bljpm* para ver la lista de números.`)
    }

    db.setting('jpmBlacklist', blacklist)
    m.react('✅')

    return m.reply(`📢 *STATUS JPM DIPERBARUI:*\n\n${toggled.join('\n')}`)
}

export { pluginConfig as config, handler }