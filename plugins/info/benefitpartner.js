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
    txt += `Keuntungan menjadi partner ${config.bot?.name || 'Bot'}:\n\n`

    txt += `🔓 *Acceso a la alimentación*
`
    txt += `├ Todas las características premium están abiertas
`
    txt += `├ Energi & koin unlimited\n`
    txt += `├ acceso específico del propietario del comando
`
    txt += `└ Prioritas support\n\n`

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
    txt += `├ Badge partner di profil\n`
    txt += `└ Acceso a la función temprana

`

    txt += `💰 *Cara Jadi Partner*\n`
    txt += `├ Propietario de contacto: ${config.owner?.name || 'Owner'}\n`
    txt += `├ Duración: 30 / 60 / 90 días
`
    txt += `└ Command: \`${prefix}addpartner\` (owner only)\n\n`

    txt += `📋 *Command Partner*\n`
    txt += `├ \`${prefix}cekpartner\` — Cek status partner\n`
    txt += `├ \`${prefix}cekprem\` — Cek status premium\n`
    txt += `├ \`${prefix}cekowner\` — Cek role user\n`
    txt += `└ \`${prefix}listpartner\` - Una lista de socios.

`

    txt += `> _Llame al propietario para más información._`

    await m.reply(txt)
}

export { pluginConfig as config, handler }