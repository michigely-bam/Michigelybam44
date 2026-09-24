import { getDatabase } from '../../src/lib/ourin-database.js'
import { fetchGroupsSafe } from '../../src/lib/ourin-jpm-helper.js'
import config from '../../config.js'

const pluginConfig = {
  name: 'bcgc',
  alias: ['broadcastgc', 'bcgroup'],
  category: 'owner',
  description: "Transmisión de mensajes a todos los grupos",
  usage: ".bcgc on / off / < Mensaje",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true
}

function getBcContextInfo() {
  const saluranId = config.saluran?.id || ''
  const saluranName = config.saluran?.name || config.bot?.name || ''
  const ctx = {
    forwardingScore: 1,
    isForwarded: true,
  }
  if (saluranId && saluranId !== '-@newsletter') {
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: Math.floor(Math.random() * 1000) + 1
    }
  }
  return ctx
}

function parseDelay(input) {
  if (!input) return null
  const match = input.match(/^(\d+)(s|m|h|d)$/i)
  if (!match) return null
  const val = parseInt(match[1])
  const unit = match[2].toLowerCase()
  switch (unit) {
    case 's': return val * 1000
    case 'm': return val * 60 * 1000
    case 'h': return val * 60 * 60 * 1000
    case 'd': return val * 24 * 60 * 60 * 1000
    default: return null
  }
}

async function handler(m, { sock }) {
  const db = getDatabase()
  const input = m.fullArgs?.trim() || m.text?.trim() || ''

  if (input.toLowerCase() === 'on') {
    db.setting('bcgcEnabled', true)
    return m.reply("✅ Difusión a grupos *activada*")
  }

  if (input.toLowerCase() === 'off') {
    db.setting('bcgcEnabled', false)
    return m.reply("✅ Grupo de radiodifusión *desactivado*")
  }

  if (!input) {
    const enabled = db.setting('bcgcEnabled')
    const jeda = db.setting('jedaBcgc') || 5000
    return m.reply(
      `📢 *BROADCAST GRUPO*

` +
      `Status: ${enabled ? "✅ Activo" : "❌ Inactivo"}\n` +
      `Intervalo: ${jeda}ms (${(jeda / 1000).toFixed(1)}s)\n\n` +
      `*USO:*
` +
      `• \`${m.prefix}bcgc on\` — Activar
` +
      `• \`${m.prefix}bcgc off\` — Desactiva
` +
      `• \`${m.prefix}bcgc <mensaje>\` — Enviar una transmisión
` +
      `• \`${m.prefix}bcgc (Responde media)\` — Enviar con los medios

` +
      `*INTERVALO:*
` +
      `• \`${m.prefix}jedabcgc 5s\` — Establezca una pausa de 5 segundos
` +
      `• \`${m.prefix}jedabcgc 2m\` — Establece una pausa de 2 minutos`
    )
  }

  if (global.statusBcgc) {
    return m.reply(`❌ El grupo de radiodifusión está funcionando.
Escribe \`${m.prefix}stopbcgc\` Parar.`)
  }

  const enabled = db.setting('bcgcEnabled')
  if (!enabled) {
    return m.reply(`❌ El grupo de radiodifusión no ha sido activado.
Escribe \`${m.prefix}Usa \`bcgc on\` primero.`)
  }

  m.react('📢')

  try {
    let mediaBuffer = null
    let mediaType = null
    const qmsg = m.quoted || m

    if (qmsg.isImage) {
      try { mediaBuffer = await qmsg.download(); mediaType = 'image' } catch {}
    } else if (qmsg.isVideo) {
      try { mediaBuffer = await qmsg.download(); mediaType = 'video' } catch {}
    }

    const allGroups = await fetchGroupsSafe(sock)
    let groupIds = Object.keys(allGroups)

    const blacklist = db.setting('jpmBlacklist') || []
    groupIds = groupIds.filter(id => !blacklist.includes(id))

    if (groupIds.length === 0) {
      m.react('❌')
      return m.reply("❌ No hay grupo encontrado.")
    }

    const jeda = db.setting('jedaBcgc') || 5000
    const ctx = getBcContextInfo()

    await sock.sendMessage(m.chat, {
      text:
        `📢 *broadcast grupo*

` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 mensaje: \`${input.substring(0, 50)}${input.length > 50 ? '...' : ''}\`\n` +
        `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : "No"}\`\n` +
        `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${groupIds.length}\` grupo
` +
        `┃ ⏱️ INTERVALO: \`${jeda}ms\`\n` +
        `┃ 📊 ESTIMACIÓN: \`${Math.ceil((groupIds.length * jeda) / 60000)} minutos\`
` +
        `╰┈┈⬡\n\n` +
        `> Iniciando la difusión...`,
      contextInfo: ctx
    }, { quoted: m })

    global.statusBcgc = true
    let success = 0
    let failed = 0

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc
        break
      }
      try {
        if (mediaBuffer) {
          await sock.sendMedia(gid, mediaBuffer, input, null, {
            type: mediaType,
            contextInfo: ctx
          })
        } else {
          await sock.sendText(gid, input, null, { contextInfo: ctx })
        }
        success++
      } catch {
        failed++
      }
      await new Promise(r => setTimeout(r, jeda))
    }

    delete global.statusBcgc
    m.react('✅')

    await sock.sendMessage(m.chat, {
      text:
        `✅ *broadcast terminado*

` +
        `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
        `┃ ✅ correcto: \`${success}\`\n` +
        `┃ ❌ ERROR: \`${failed}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${groupIds.length}\`\n` +
        `╰┈┈⬡`,
      contextInfo: ctx
    }, { quoted: m })
  } catch (e) {
    delete global.statusBcgc
    m.react('❌')
    m.reply("Falló: " + e.message)
  }
}

export { pluginConfig as config, handler }
