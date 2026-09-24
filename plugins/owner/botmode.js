import * as pakasir from '../../src/lib/ourin-pakasir.js'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'owner',
    description: 'Configurar el modo del bot (md/cpanel/store/pushkontak/all)',
    usage: '.botmode <mode> [--autoorder]',
    example: '.botmode store --autoorder',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}
const VALID_MODES = ['md', 'cpanel', 'store', 'pushkontak', 'all']
const MODE_DESCRIPTIONS = {
    md: 'Modo predeterminado: todas las funciones excepto panel/store/pushkontak',
    cpanel: 'Modo panel: main + group + sticker + owner + tools + panel',
    store: 'Modo tienda: main + group + sticker + owner + store',
    pushkontak: 'Modo pushkontak: main + group + sticker + owner + pushkontak',
    all: 'Modo completo: permite las funciones de todos los modos'
}
async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    const isAutoorder = false
    const globalMode = db.setting('botMode') || 'md'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupMode = groupData.botMode || null
    if (!mode) {
        const autoorderStatus = groupData.storeConfig?.autoorder ? '✅ ON' : '❌ OFF'
        let txt = `╭┈┈⬡「 🤖 *ʙᴏᴛ ᴍᴏᴅᴇ* 」
┃ ㊗ ɢʟᴏʙᴀʟ: *${globalMode.toUpperCase()}*
${m.isGroup ? `┃ ㊗ GRUPO: *${(groupMode || 'INHERIT').toUpperCase()}*\n` : ''}${m.isGroup && (groupMode === 'store' || (!groupMode && globalMode === 'store')) ? `┃ ㊗ ᴀᴜᴛᴏᴏʀᴅᴇʀ: *${autoorderStatus}*\n` : ''}╰┈┈⬡
╭┈┈⬡「 📋 *MODOS DISPONIBLES* 」
`
        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡
*OPCIONES DE TIENDA:*
> \`${m.prefix}botmode store\` - Pedido manual
> \`${m.prefix}botmode store --autoorder\` - Pago automático
> \`${m.prefix}botmode md\` → Modo predeterminado
> \`${m.prefix}botmode all\` Todas las características`
        await m.reply(txt)
        return
    }
    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *MODO NO VÁLIDO*\n\n` +
            `> Modos disponibles: \`${VALID_MODES.join(', ')}\``
        )
    }
    console.log('[Botmode] Debug:', { args: m.args, mode, flags, isAutoorder })
    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botMode: mode
        }
        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                autoorder: isAutoorder,
                products: groupData.storeConfig?.products || []
            }
        }
        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botMode', mode)
    }
    db.save()
    await m.react('✅')
    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        if (isAutoorder) {
            try {
                if (!pakasir.isEnabled()) {
                    extraInfo = `\n\n⚠️ *PAKASIR NO ESTÁ CONFIGURADO*\n` +
                        `> Configura pakasir.slug y pakasir.apiKey en config.js`
                } else {
                    extraInfo = `\n\n✅ *PEDIDO AUTOMÁTICO ACTIVO*\n` +
                        `> Pagos automáticos mediante Pakasir`
                }
            } catch {
                extraInfo = `\n\n⚠️ *No se encontró el módulo de Pakasir*`
            }
        } else {
            extraInfo = `\n\n📋 *MODO MANUAL*\n> Un administrador debe confirmar cada pedido`
        }
    }
    await m.reply(
        `✅ *MODO CAMBIADO*\n\n` +
        `> Modo: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        (mode === 'store' && m.isGroup ? `> Autoorder: *${isAutoorder ? 'ON' : 'OFF'}*` : '') +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `> _El modo de este grupo también fue cambiado._` : `> _El modo global fue cambiado._`)
    )
    console.log(`[BotMode] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}
export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }
