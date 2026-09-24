import { getQuotedStickerHash, deleteStickerCommand, listStickerCommands, findByCommand } from '../../src/lib/ourin-sticker-command.js'
const pluginConfig = {
    name: 'delstickercmd',
    alias: ['delcmdsticker', 'removesticker', 'unsticker'],
    category: 'group',
    description: "Eliminar el comando sticker",
    usage: ".delstickercmd <command> o sticker de respuesta",
    example: '.delstickercmd menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    if (!commandName && !m.quoted) {
        const existingCmds = listStickerCommands()
        if (existingCmds.length === 0) {
            return m.reply(
                `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n` +
                `> No hay comandos de sticker registrados.
` +
                `> Agrega con \`.addcmdsticker\``
            )
        }
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n`
        txt += `╭┈┈⬡「 📋 *LISTA* 」\n`
        
        for (const cmd of existingCmds) {
            txt += `┃ 🖼️ → \`.${cmd.command}\`\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `*Suprímase con:*
`
        txt += `> \`.delstickercmd <command>\`\n`
        txt += `> o sticker de respuesta + \`.delstickercmd\``
        
        return m.reply(txt)
    }
    
    let deleted = false
    let deletedCmd = ''
    if (m.quoted) {
        const stickerHash = getQuotedStickerHash(m)
        if (stickerHash) {
            const success = deleteStickerCommand(stickerHash)
            if (success) {
                deleted = true
                deletedCmd = "adhesivos de repulsión"
            }
        }
    }
    if (!deleted && commandName) {
        const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
        const found = findByCommand(cleanCmd)
        
        if (found) {
            const success = deleteStickerCommand(found.hash)
            if (success) {
                deleted = true
                deletedCmd = cleanCmd
            }
        } else {
            return m.reply(
                `❌ Sticker command \`${cleanCmd}¡\` no encontrado!

` +
                `> Vea la lista con \`.delstickercmd\``
            )
        }
    }
    
    if (deleted) {
        await m.react('✅')
        await m.reply(
            `✅ *el comando de pegatinas se eliminó*

` +
            `> 🗑️ \`${deletedCmd}Se ha eliminado.`
        )
    } else {
        await m.reply(
            `❌ ¡No se ha eliminado!

` +
            `> Responda a las stickers que desees eliminar, o
` +
            `> Escribe el nombre del comando: \`.delstickercmd menu\``
        )
    }
}

export { pluginConfig as config, handler }
