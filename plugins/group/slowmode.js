import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'slowmode',
    alias: ['slow', 'setslowmode'],
    category: 'group',
    description: 'Modo lento: limita la frecuencia de mensajes de los miembros',
    usage: '.slowmode <on/off/cmdonly> [segundos]',
    example: '.slowmode on 30',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const lastMessageTime = new Map()

const PRESETS = {
    santai: 10,
    normal: 30,
    ketat: 60,
    superketat: 120,
    max: 300,
}

const MODES = {
    all: "Todos los mensajes + comandos son eliminados",
    onlycommand: "El comando en silencio, el chat normal sigue funcionando",
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const subCmd = args[0]?.toLowerCase()
    let groupData = db.getGroup(m.chat) || {}

    if (!subCmd || subCmd === 'status') {
        const sm = groupData.slowmode || {}
        const enabled = sm.enabled
        const delay = sm.delay || 30
        const mode = sm.mode || 'all'
        const presetList = Object.entries(PRESETS)
            .map(([name, sec]) => `  *.slowmode ${name}* — ${sec}s`)
            .join('\n')

        return m.reply(
            `🐢 *SLOWMODE*\n\n` +
            `Status: ${enabled ? `✅ ON (${delay}s)` : '❌ OFF'}\n` +
            `Mode: *${mode}*\n\n` +
            `*Uso:*
` +
            `*.slowmode en 30* — todos los mensajes + comandos
` +
            `*.slowmode onlycommand 30* — command only\n` +
            `*.slowmode off* — desactivar

` +
            `*Preset:*\n${presetList}\n\n` +
            `*Mode:*\n` +
            `  *all* — borrar todos los mensajes en el retraso
` +
            `  *onlycommand* — solo comandos; el resto del chat queda libre\n\n` +
            `_Admin & owner no se ve afectado_`
        )
    }

    if (subCmd === 'off') {
        db.setGroup(m.chat, { ...groupData, slowmode: { enabled: false } })
        return m.reply(`✅ Slowmode *desactivado*`)
    }

    let mode = 'all'
    let delay
    let delayArg

    if (subCmd === 'onlycommand' || subCmd === 'oc') {
        mode = 'onlycommand'
        delayArg = args[1]
    } else if (subCmd === 'on' || subCmd === 'set') {
        delayArg = args[1]
    } else if (PRESETS[subCmd]) {
        delay = PRESETS[subCmd]
        mode = args[1]?.toLowerCase() === 'onlycommand' || args[1]?.toLowerCase() === 'oc'
            ? 'onlycommand' : 'all'
    } else {
        delay = parseInt(subCmd)
        if (isNaN(delay)) {
            return m.reply(`❌ Utilice *.slowmode en 30* o *.slowmode onlycommand 30*`)
        }
    }

    if (!delay) {
        if (delayArg && PRESETS[delayArg]) {
            delay = PRESETS[delayArg]
        } else {
            delay = parseInt(delayArg) || 30
        }
    }

    if (delay < 5 || delay > 600) {
        return m.reply(`❌ El retraso debe ser entre 5-600 segundos`)
    }

    db.setGroup(m.chat, {
        ...groupData,
        slowmode: { enabled: true, delay, mode }
    })

    const presetName = Object.entries(PRESETS).find(([, v]) => v === delay)?.[0]
    const label = presetName ? ` (${presetName})` : ''
    const modeDesc = MODES[mode]

    await m.reply(
        `✅ Slowmode *activo*

` +
        `Delay: *${delay} segundos*${label}\n` +
        `Mode: *${mode}*\n` +
        `${modeDesc}\n\n` +
        `_Admin & owner no se ve afectado_`
    )
}

function checkSlowmode(m, sock, db) {
    if (!m.isGroup) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.slowmode?.enabled) return false

    const sm = groupData.slowmode
    const mode = sm.mode || 'all'

    if (mode === 'onlycommand' && !m.isCommand) return false

    const delay = sm.delay || 30
    const key = `${m.chat}_${m.sender}`
    const now = Date.now()

    const lastTime = lastMessageTime.get(key) || 0
    const timePassed = (now - lastTime) / 1000

    if (timePassed < delay) {
        return { remaining: Math.ceil(delay - timePassed), mode }
    }

    lastMessageTime.set(key, now)

    if (lastMessageTime.size > 5000) {
        const cutoff = now - 600_000
        for (const [k, v] of lastMessageTime) {
            if (v < cutoff) lastMessageTime.delete(k)
        }
    }

    return false
}

export { pluginConfig as config, handler, checkSlowmode }
