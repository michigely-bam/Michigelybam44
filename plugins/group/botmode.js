import * as pakasir from '../../src/lib/ourin-pakasir.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'group',
    description: "Establecer modo de arranque para este grupo",
    usage: '.botmode <md/cpanel/pushkontak/store/otp/all>',
    example: '.botmode store',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const MODES = {
    md: {
        name: 'Multi-Device',
        desc: "Modo predeterminado con todas las características estándar",
        allowedCategories: null,
        excludeCategories: ['cpanel', 'pushkontak', 'store']
    },
    all: {
        name: 'All Features',
        desc: "Todas las características de todas las modalidades son accesibles",
        allowedCategories: null,
        excludeCategories: null
    },
    cpanel: {
        name: 'CPanel Pterodactyl',
        desc: "Modo especial para el panel del servidor",
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'tools', 'panel'],
        excludeCategories: null
    },
    pushkontak: {
        name: 'Envío de contactos',
        desc: "Modo especial para empujar contactos a los miembros",
        allowedCategories: ['owner', 'main', 'group', 'sticker', 'pushkontak'],
        excludeCategories: null
    },
    store: {
        name: 'Tienda',
        desc: "Modalidad especial para tiendas en línea",
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'store'],
        excludeCategories: null
    },
    otp: {
        name: 'OTP Service',
        desc: 'Modo de servicio OTP automático',
        allowedCategories: ['main', 'group', 'sticker', 'owner'],
        excludeCategories: null
    }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())

    const groupData = db.getGroup(m.chat) || {}
    const currentMode = groupData.botMode || 'md'

    if (!mode) {
        let modeList = ''
        for (const [key, val] of Object.entries(MODES)) {
            const isCurrent = key === currentMode ? ' ⬅️' : ''
            modeList += `┃ \`${m.prefix}botmode ${key}\`${isCurrent}\n`
            modeList += `┃ └ ${val.desc}\n`
        }

        const autoorderStatus = groupData.storeConfig?.autoorder ? '✅ ON' : '❌ OFF'

        return m.reply(
            `🔧 *ʙᴏᴛ ᴍᴏᴅᴇ*\n\n` +
            `> Modo actual: *${currentMode.toUpperCase()}* (${MODES[currentMode]?.name || 'Desconocido'})\n` +
            (currentMode === 'store' ? `> Autoorder: *${autoorderStatus}*\n` : '') +
            `\n╭─「 📋 *OPCIONES* 」\n` +
            `${modeList}` +
            `╰───────────────\n\n` +
            `*ꜰʟᴀɢ sᴛᴏʀᴇ:*\n` +
            `> \`${m.prefix}botmode store\` - Pedido manual\n` +
            `> \`${m.prefix}botmode store --autoorder\` - Pago automático\n\n` +
            `> _Configuración independiente por grupo_`
        )
    }

    if (!Object.keys(MODES).includes(mode)) {
        return m.reply(`❌ modo inválido. Opciones: \`${Object.keys(MODES).join(', ')}\``)
    }

    const isAutoorder = false

    const newGroupData = {
        ...groupData,
        botMode: mode
    }

    if (mode === 'store') {
        let pakasirEnabled = false
        try {

            pakasirEnabled = pakasir.isEnabled()
        } catch (e) {}

        if (isAutoorder && !pakasirEnabled) {
            return m.reply(
                `⚠️ *NO SE PUEDE ACTIVAR EL PEDIDO AUTOMÁTICO*\n\n` +
                `> Pakasir no está configurado.\n\n` +
                `*Configuración:*\n` +
                `1. Abre \`config.js\`\n` +
                `2. Configura \`pakasir.slug\` y \`pakasir.apiKey\`\n` +
                `3. Reinicia el bot\n\n` +
                `> O usa el modo manual:\n` +
                `\`${m.prefix}botmode store\``
            )
        }

        newGroupData.storeConfig = {
            ...(groupData.storeConfig || {}),
            autoorder: isAutoorder,
            products: groupData.storeConfig?.products || []
        }
    }

    db.setGroup(m.chat, newGroupData)
    db.save()

    m.react('✅')

    let extraInfo = ''
    if (mode === 'store') {
        const products = newGroupData.storeConfig?.products || []
        if (isAutoorder) {
            extraInfo = `\n\n✅ *¡PEDIDO AUTOMÁTICO ACTIVO!*\n` +
                `> Pagos automáticos mediante Pakasir\n` +
                `> Productos: \`${products.length}\``
        } else {
            extraInfo = `\n\n📋 *MODO MANUAL*\n` +
                `> Un administrador debe confirmar cada pedido\n` +
                `> Productos: \`${products.length}\`\n\n` +
                `*GUÍA:*\n` +
                `> \`${m.prefix}addprod <código> <precio> <nombre>\`\n` +
                `> \`${m.prefix}listprod\` - Ver los productos`
        }
    }

    return m.reply(
        `✅ *MODO CAMBIADO*\n\n` +
        `> Modo: *${mode.toUpperCase()}* (${MODES[mode].name})\n` +
        `> Grupo: *${m.chat.split('@')[0]}*\n` +
        (mode === 'store' ? `> Autoorder: *${isAutoorder ? 'ON' : 'OFF'}*` : '') +
        extraInfo +
        `

> Escribe \`${m.prefix}menu\` para ver el menú.`
    )
}

function getGroupMode(chatJid, db) {
    const globalMode = db.setting('botMode') || 'md'
    if (!chatJid?.endsWith('@g.us')) return globalMode
    const groupData = db.getGroup(chatJid) || {}
    return groupData.botMode || globalMode
}

function getModeCategories(mode) {
    const modeConfig = MODES[mode] || MODES.md
    return {
        allowed: modeConfig.allowedCategories,
        excluded: modeConfig.excludeCategories
    }
}

function filterCategoriesByMode(categories, mode) {
    const modeConfig = MODES[mode] || MODES.md

    if (modeConfig.allowedCategories) {
        return categories.filter(cat => modeConfig.allowedCategories.includes(cat.toLowerCase()))
    }

    if (modeConfig.excludeCategories) {
        return categories.filter(cat => !modeConfig.excludeCategories.includes(cat.toLowerCase()))
    }

    return categories
}

export { pluginConfig as config, handler, getGroupMode, getModeCategories, filterCategoriesByMode, MODES }
