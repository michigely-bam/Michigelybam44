import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'blautojpm',
    alias: ['blacklistautojpm', 'autojpmbl', 'listblautojpm'],
    category: 'jpm',
    description: "Grupo especial de lista negra Auto JPM con número de secuencia",
    usage: ".blautojpm [número]",
    example: '.blautojpm 2 3 7',
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
    let blacklist = db.setting('autoJpmBlacklist') || []
    const allGroups = await sock.groupFetchAllParticipating()
    const groups = Object.values(allGroups).sort((a, b) => a.subject.localeCompare(b.subject))
    if (!m.text) {
        if (groups.length === 0) {
            return m.reply(`❌ La bota aún no está en ningún grupo.`)
        }

        let listText = `📋 *LISTA NEGRA DE GRUPOS Y AUTO-JPM*

`
        listText += `A continuación *${groups.length} grupo*El que fue seguido por el bot ${config.bot?.name}\n`
        listText += `Tanda *(🚫)* significa que el grupo está siendo una lista negra especial para las características de AutoJPM.

`

        for (let i = 0; i < groups.length; i++) {
            const isBlacklisted = blacklist.includes(groups[i].id)
            const icon = isBlacklisted ? ' 🚫' : ''
            listText += `*${i + 1}.* ${groups[i].subject}${icon}\n`
        }

        listText += `
*MODO BLACKLIST / UN-BLACKLIST:*
`
        listText += `Tipo comando seguido por número de grupo para cambiar (puede ser más de uno, separado por espacio).

`
        listText += `*Ejemplo:*
`
        listText += `> \`${m.prefix}blautojpm 2 3 7\``

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
                toggled.push(`*${num}.* ${targetGroup.subject} ✅ *(Eliminado de la lista negra)*`)
            } else {
                blacklist.push(targetGroup.id)
                toggled.push(`*${num}.* ${targetGroup.subject} 🚫 ~(En la lista negra)~`)
            }
        }
    }

    if (toggled.length === 0) {
        return m.reply(`❌ No hay número de grupo válido.

Escribe *${m.prefix}blautojpm* para ver la lista de números.`)
    }

    db.setting('autoJpmBlacklist', blacklist)
    m.react('✅')

    return m.reply(`📢 *LISTA NEGRA DE JPM AUTOMÁTICO ACTUALIZADA:*\n\n${toggled.join('\n')}`)
}

export { pluginConfig as config, handler }
