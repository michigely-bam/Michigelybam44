import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'hapuslist',
    alias: ['dellist', 'deletelist'],
    category: 'store',
    description: "🗑️ Eliminar la información de la tienda",
    usage: ".hapuslist <número>",
    example: '.hapuslist 1',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const lists = db.setting('storeLists') || []

    if (lists.length === 0) {
        return m.reply(`📭 *Aún no hay información.*

Añade información primero: \`${m.prefix}addlist\` ➕`)
    }

    const idx = parseInt(m.text?.trim()) - 1

    if (isNaN(idx) || idx < 0 || idx >= lists.length) {
        let txt = `🗑️ *Seleccionar información suprimida*

Escribe \`${m.prefix}Borrar la lista\`

`
        for (let i = 0; i < lists.length; i++) {
            const l = lists[i]
            const mediaIcon = l.image ? '🖼️' : l.video ? '🎬' : '📝'
            txt += `${mediaIcon} *${i + 1}.* ${l.name}\n`
        }
        return m.reply(txt)
    }

    const deleted = lists.splice(idx, 1)[0]
    db.setting('storeLists', lists)

    await m.react('✅')
    return m.reply(
        `🗑️ *SE BORRÓ LA INFORMACIÓN*

` +
        `🏷️ Nombre: *${deleted.name}*\n\n` +
        `⚠️ _La información se ha borrado permanentemente y no se puede devolver._`
    )
}

export { pluginConfig as config, handler }
