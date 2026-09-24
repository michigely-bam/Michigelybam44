import { loadSent, saveSent, loadState, saveState, getOngoingAnimeList, startAutoCheck, stopAutoCheck, runCheck, isRunning } from '../../src/lib/ourin-auto-anime.js'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'autoanimewinbu',
    alias: ['aaw', 'autoanime'],
    category: 'anime',
    description: "Auto subir el anime y donghua en curso de winbu.net (720p Pixeldrain)",
    usage: '.autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>',
    example: '.autoanimewinbu start',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, args }) {
    const sub = m.text
    const state = loadState()


    switch (sub) {
        case 'start': {
            if (isRunning()) {
                return m.reply(`⚠️ ¡El AutoAnime está en marcha!`)
            }

            const groups = state.groups || []
            if (groups.length === 0) {
                return m.reply(
                    `❌ ¡No hay ningún grupo objetivo!

` +
                    `> Agrega el grupo primero:
` +
                    `> \`${m.prefix}autoanimewinbu addgrup\` (en el grupo objetivo)
` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const interval = state.interval || 5
            startAutoCheck(sock, interval)
            saveState({ ...state, enabled: true })

            return sock.sendMessage(m.chat, {
                text: `✅ *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀʀᴛᴇᴅ*\n\n` +
                    `> 📲 Grupo objetivo: *${groups.length}*\n` +
                    `> ⏱️ Interval: *${interval} minutos*
` +
                    `> 🎞️ Filter: *Pixeldrain 720p+*\n` +
                    `> ⏰ Antigüedad máxima: *24 horas*\n\n` +
                    `La primera inspección comienza...`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Status',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🛑 Stop',
                            id: `${m.prefix}autoanimewinbu stop`
                        })
                    }
                ]
            }, { quoted: m })
        }

        case 'stop': {
            stopAutoCheck()
            saveState({ ...state, enabled: false })
            return m.reply(`🛑 *AutoAnime detenido*`)
        }

        case 'status': {
            const sent = loadSent()
            const running = isRunning()
            const groups = state.groups || []

            let txt = `📊 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀᴛᴜs*\n\n`
            txt += `> 🔄 Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n`
            txt += `> 💾 Auto-start: *${state.enabled ? 'Ya' : "No"}*\n`
            txt += `📋 Ha sido enviado: *${sent.size}* episode\n`
            txt += `> ⏱️ Interval: *${state.interval || 5} minutos*
`
            txt += `> 📲 Grupo objetivo: *${groups.length}*\n`

            if (groups.length > 0) {
                txt += `
*Grupo:*
`
                groups.forEach((g, i) => {
                    txt += `> ${i + 1}. \`${g}\`\n`
                })
            }

            return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
        }

        case 'cek':
        case 'check': {
            if (!isRunning()) {
                startAutoCheck(sock, state.interval || 5)
            }
            await m.reply("🔍 Buscando anime reciente...")
            try {
                await runCheck()
                return m.reply("✅ Comprobación terminada")
            } catch (e) {
                m.reply(te(m.prefix, m.command, m.pushName))
            }
        }

        case 'list': {
            await m.reply("📺 Tomando la lista de los anime...")
            try {
                const list = await getOngoingAnimeList()
                if (list.length === 0) return m.reply("❌ No hay anime encontrado")

                let txt = `📺 *LISTA DE ANIME RECIENTE*\n\n`
                txt += `> Total: *${list.length}* anime\n\n`
                list.slice(0, 15).forEach((a, i) => {
                    txt += `*${i + 1}.* ${a.title}\n`
                })
                if (list.length > 15) txt += `\n> ...y ${list.length - 15} más`

                return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
            } catch (e) {
                m.reply(te(m.prefix, m.command, m.pushName))
            }
        }

        case 'reset': {
            const sent = loadSent()
            const count = sent.size
            saveSent(new Set())
            return m.reply(`✅ ¡Restablecido! Se eliminaron *${count}* episodios del historial.
Todos los episodios pueden ser retransmitidos.`)
        }

        case 'addgrup':
        case 'addgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(addgrup|addgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            if (!grupId || !grupId.includes('@g.us')) {
                return m.reply(
                    `❌ ID grupo no es válido

` +
                    `> Utilice dentro de un grupo, o:
` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const groups = state.groups || []
            if (groups.includes(grupId)) {
                return m.reply(`⚠️ El grupo ya está en la lista de objetivos`)
            }

            groups.push(grupId)
            saveState({ ...state, groups })
            return m.reply(`✅ Grupo \`${grupId}\` añadido al objetivo
> Total: *${groups.length}* grupo`)
        }

        case 'delgrup':
        case 'delgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(delgrup|delgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            const groups = state.groups || []
            const idx = groups.indexOf(grupId)
            if (idx === -1) {
                return m.reply(`❌ Los grupos no se encuentran en la lista de objetivos`)
            }

            groups.splice(idx, 1)
            saveState({ ...state, groups })
            return m.reply(`✅ Grupo \`${grupId}\` eliminado del objetivo
> Restante: *${groups.length}* grupo`)
        }

        case 'interval': {
            const rest = (typeof args === 'string' ? args : '').replace(/^interval\s*/i, '').trim()
            const mins = parseInt(rest)
            if (!mins || mins < 1 || mins > 60) {
                return m.reply(`❌ El intervalo debe ser de 1 a 60 minutos.

> Ejemplo: \`${m.prefix}autoanimewinbu interval 10\``)
            }

            saveState({ ...state, interval: mins })

            if (isRunning()) {
                stopAutoCheck()
                startAutoCheck(sock, mins)
            }

            return m.reply(`✅ El intervalo fue cambiado a *${mins} minutos*`)
        }

        default: {
            const running = isRunning()
            return sock.sendMessage(m.chat, {
                text: `🎬 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ ᴡɪɴʙᴜ*\n\n` +
                    `> Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n\n` +
                    `*ᴄᴏᴍᴍᴀɴᴅs:*\n` +
                    `> \`${m.prefix}aaw start\` — Comienza el auto-cheque
` +
                    `> \`${m.prefix}aaw stop\` — Hentikan\n` +
                    `> \`${m.prefix}aaw status\` — Véase el estado
` +
                    `> \`${m.prefix}aaw check\` — Manual check ahora
` +
                    `> \`${m.prefix}aaw list\` — Lista de los últimos anime
` +
                    `> \`${m.prefix}aaw addgrup\` — Agrega el grupo objetivo
` +
                    `> \`${m.prefix}aaw delgrup\` — Eliminar el grupo objetivo
` +
                    `> \`${m.prefix}aaw interval 10\` — Cambiar el intervalo
` +
                    `> \`${m.prefix}aaw reset\` — Restablecer el historial de envíos`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: running ? '🛑 Stop' : '▶️ Start',
                            id: `${m.prefix}autoanimewinbu ${running ? 'stop' : 'start'}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Status',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    }
                ]
            }, { quoted: m })
        }
    }
}

export { pluginConfig as config, handler }
