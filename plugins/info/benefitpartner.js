import config from '../../config.js'
const pluginConfig = {
    name: 'benefitpartner',
    alias: ['partnerbenefits', 'keuntunganpartner'],
    category: 'info',
    description: "Mira los beneficios de ser un compañero bot",
    usage: '.benefitpartner',
    example: '.benefitpartner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *BENEFIT PARTNER*\n\n`
    txt += `Ventajas de ser socio ${config.bot?.name || 'Bot'}:\n\n`

    txt += `🔓 *Acceso a la alimentación*
`
    txt += `├ Todas las características premium están abiertas
`
    txt += `├ Energía y monedas ilimitadas
`
    txt += `├ acceso específico del propietario del comando
`
    txt += `└ Atención prioritaria

`

    txt += `📦 *Panel Pterodactyl*\n`
    txt += `├ Podría crear su propio servidor
`
    txt += `├ Placa de gestión de acceso
`
    txt += `└ Puede vender paneles.

`

    txt += `💎 *Bonus*\n`
    txt += `├ +200,000 EXP durante la activación
`
    txt += `├ +20.000 monedas durante la activación.
`
    txt += `├ Insignia de socio en el perfil
`
    txt += `└ Acceso a la función temprana

`

    txt += `💰 *Cómo hacerse socio*
`
    txt += `├ Propietario de contacto: ${config.owner?.name || 'Owner'}\n`
    txt += `├ Duración: 30 / 60 / 90 días
`
    txt += `└ Command: \`${prefix}addpartner\` (owner only)\n\n`

    txt += `📋 *Command Partner*\n`
    txt += `├ \`${prefix}cekpartner\` — Consultar estado de socio
`
    txt += `├ \`${prefix}cekprem\` — Consultar estado prémium
`
    txt += `├ \`${prefix}cekowner\` — Consultar rol del usuario
`
    txt += `└ \`${prefix}listpartner\` - Una lista de socios.

`

    txt += `> _Llame al propietario para más información._`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
