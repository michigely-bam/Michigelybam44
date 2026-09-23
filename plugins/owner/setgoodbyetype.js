import fs from 'fs'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setgoodbyetype',
    alias: ['goodbyetype', 'goodbyevariant', 'goodbyestyle'],
    category: 'owner',
    description: 'Mengatur variant tampilan goodbye message',
    usage: '.setgoodbyetype',
    example: '.setgoodbyetype',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}
const VARIANTS = {
    1: { name: 'Canvas Image', desc: "Imagen de un lienzo con foto de perfil" },
    2: { name: 'Carousel Cards', desc: "Tarjeta interactiva con llave (NOTA: despedida de soltero no afecta esto)" },
    3: { name: 'Text Only', desc: "Mensajes de texto minimalistas sin imágenes" },
    4: { name: 'Group', desc: "Externamente grupo AdReply (NOTE: Setgoodbye no afecta esto)" },
    5: { name: 'Simple', desc: "Mensaje de texto simple + perfil de foto" }
}
async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()
    const current = db.setting('goodbyeType') || 1
    if (variant && /^v?[1-5]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('goodbyeType', id)
        await db.save()
        await m.reply(
            `✅ Goodbye type diubah ke *V${id}*\n` +
            `*${VARIANTS[id].name}*\n` +
            `_${VARIANTS[id].desc}_`
        )
        return
    }
    const buttons = []
    for (const [id, val] of Object.entries(VARIANTS)) {
        const mark = parseInt(id) === current ? ' ✓' : ''
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `V${id}${mark} - ${val.name}`,
                id: `${m.prefix}setgoodbyetype v${id}`
            })
        })
    }
    await sock.sendButton(m.chat, fs.readFileSync('./assets/images/ourin.jpg'), `🥗 *TIPE GOODBYE*
Tipo actual es la versión *${current}*\n_${VARIANTS[current].name}_

Por favor, seleccione una variable de despedida:`, m, { buttons })
}
export { pluginConfig as config, handler }