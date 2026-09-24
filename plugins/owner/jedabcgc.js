import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
  name: 'jedabcgc',
  alias: ['delaybcgc', 'setjedabcgc'],
  category: 'owner',
  description: "Establecer una pausa de grupo de difusión",
  usage: '.jedabcgc <tiempo>',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
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

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)} días`
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)} horas`
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)} minutos`
  return `${(ms / 1000).toFixed(0)} segundos`
}

async function handler(m) {
  const db = getDatabase()
  const input = m.text?.trim()
  const current = db.setting('jedaBcgc') || 5000

  if (!input) {
    return m.reply(
      `⏱️ *INTERVALO DE DIFUSIÓN GRUPAL*

` +
      `Huelga actual: *${formatDelay(current)}* (${current}ms)\n\n` +
      `*MODO DE USO:*
` +
      `> \`${m.prefix}jedabcgc <número><unidad>\`\n\n` +
      `*UNIDADES:*
` +
      `• \`s\` — segundos
• \`m\` — minutos
• \`h\` — horas
• \`d\` — días

` +
      `*EJEMPLO:*\n` +
      `> \`${m.prefix}jedabcgc 5s\` → 5 segundos
` +
      `> \`${m.prefix}jedabcgc 2m\` → 2 minutos
` +
      `> \`${m.prefix}jedabcgc 1h\` → 1 hora`
    )
  }

  const ms = parseDelay(input)
  if (!ms || ms < 1000) {
    return m.reply("❌ Formato inválido. `5s`, `2m`, `1h`, `1d`")
  }

  const prev = current
  db.setting('jedaBcgc', ms)

  return m.reply(
    `✅ *La pausa de transmisión del grupo fue modificada*

` +
    `Anteriormente: *${formatDelay(prev)}*\n` +
    `Ahora: *${formatDelay(ms)}*`
  )
}

export { pluginConfig as config, handler }
