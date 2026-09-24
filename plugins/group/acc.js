import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'acc',
    alias: ['accall', 'joinrequest', 'reqjoin'],
    category: 'group',
    description: "Solicitud de entrada de grupo de gestión (aceptar / rechazar)",
    usage: ".acc − lista",
    example: '.acc approve all',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatDate(timestamp) {
    return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp * 1000))
}

async function handler(m, { sock }) {
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const option = args.slice(1).join(' ')?.trim()

    if (!sub || !['list', 'approve', 'reject'].includes(sub)) {
        return m.reply(
            `📋 *GESTOR DE SOLICITUDES DE INGRESO*\n\n` +
            `╭┈┈⬡「 📌 *COMANDOS* 」\n` +
            `┃ ${m.prefix}acc list\n` +
            `┃ ${m.prefix}acc approve all\n` +
            `┃ ${m.prefix}acc reject all\n` +
            `┃ ${m.prefix}acc approve 1|2|3\n` +
            `┃ ${m.prefix}acc reject 1|2|3\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }

    await m.react('🕕')

    try {
        const pendingList = await sock.groupRequestParticipantsList(m.chat)

        if (!pendingList?.length) {
            await m.react('📭')
            return m.reply(`📭 No hay solicitud de entrada pendiente.`)
        }

        if (sub === 'list') {
            let text = `📋 *lista de solicitudes de ingreso*

`
            text += `> Total: ${pendingList.length} solicitudes

`

            for (let i = 0; i < pendingList.length; i++) {
                const req = pendingList[i]
                const number = req.jid?.split('@')[0] || 'Desconocido'
                const method = req.request_method || '-'
                const time = req.request_time ? formatDate(req.request_time) : '-'

                text += `*${i + 1}.* @${number}\n`
                text += `   📱 ${number}\n`
                text += `   📨 ${method}\n`
                text += `   🕐 ${time}\n\n`
            }

            text += `> Usa \`${m.prefix}acc approve all\` o \`${m.prefix}acc reject all\``

            const mentions = pendingList.map(r => r.jid)
            await m.react('📋')
            return m.reply(text, { mentions })
        }

        const action = sub

        if (option === 'all') {
            const jids = pendingList.map(r => r.jid)

            const results = await sock.groupRequestParticipantsUpdate(m.chat, jids, action)

            const success = results.filter(r => r.status === '200' || !r.status || r.status === 200).length
            const failed = results.length - success

            const label = action === 'approve' ? 'Aceptadas' : 'Rechazadas'
            await m.react('✅')
            return m.reply(
                `✅ *${label.toUpperCase()} TODOS*

` +
                `> ✅ Correcto: ${success}\n` +
                `> ❌ Falló: ${failed}\n` +
                `> 📊 Total: ${results.length}`
            )
        }

        const indices = option.split('|').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < pendingList.length)

        if (!indices.length) {
            await m.react('❌')
            return m.reply(
                `❌ El número no es válido.

` +
                `> Usa \`${m.prefix}acc list\` para ver la lista.
` +
                `> Ejemplo: \`${m.prefix}acc ${action} 1|2|3\``
            )
        }

        const targets = indices.map(i => pendingList[i])
        let text = ''
        const label = action === 'approve' ? 'Aceptado' : 'Rechazado'
        let successCount = 0

        for (const target of targets) {
            try {
                const result = await sock.groupRequestParticipantsUpdate(m.chat, [target.jid], action)
                const status = result[0]?.status
                const ok = status === '200' || !status || status === 200

                const number = target.jid.split('@')[0]
                text += `${ok ? '✅' : '❌'} ${number} — ${ok ? label : "Falló"}\n`
                if (ok) successCount++
            } catch {
                const number = target.jid.split('@')[0]
                text += `❌ ${number} — Error\n`
            }
        }

        await m.react('✅')
        return m.reply(
            `📋 *RESULTADO ${label.toUpperCase()}*\n\n` +
            text + `\n` +
            `> ✅ ${successCount}/${targets.length} correcto`
        )
    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
