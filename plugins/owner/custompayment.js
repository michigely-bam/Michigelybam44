import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
  name: 'custompayment',
  alias: ['setpayment', 'setpaytext'],
  category: 'owner',
  description: "Establecer texto personalizado para .payment con accionistas",
  usage: '.custompayment <texto> / .custompayment reset',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  const db = getDatabase()
  const input = m.text?.trim()
  const current = db.setting('customPaymentText') || ''

  if (!input) {
    return m.reply(
      `📝 *CUSTOM PAYMENT TEXT*\n\n` +
      `El texto actual es:
${current || "_(no está configurado, por defecto)_"}\n\n` +
      `*PLACEHOLDER DISPONIBLE:*
` +
      `• \`{botname}\` — Nombre del bot
` +
      `• \`{owner}\` — Nombre del propietario
` +
      `• \`{methods}\` — Lista de billeteras electrónicas
` +
      `• \`{banks}\` — Lista de los bancos
` +
      `• \`{qris}\` — Status QRIS\n\n` +
      `*EJEMPLO:*\n` +
      `> \`${m.prefix}custompayment Halo! ¡Pago a los métodos!

` +
      `> \`${m.prefix}custompayment reset\` — Volver a la configuración por defecto`
    )
  }

  if (input.toLowerCase() === 'reset') {
    db.setting('customPaymentText', '')
    return m.reply("✅ Texto de correo electrónico personalizado reset a default.")
  }

  db.setting('customPaymentText', input)
  return m.reply(`✅ ¡Texto de pago personalizado guardado!

Preview:
${input}`)
}

export { pluginConfig as config, handler }
