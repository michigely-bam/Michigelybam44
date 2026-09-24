import { getQuotedStickerHash, addStickerCommand, listStickerCommands } from '../../src/lib/ourin-sticker-command.js'
import { getPlugin } from '../../src/lib/ourin-plugins.js'
const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addstickercmd', 'setsticker', 'stickeradd'],
    category: 'group',
    description: "Usar un sticker como acceso directo a un comando",
    usage: '.addcmdsticker <command> (reply sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    
    // Validación del nombre del comando
    if (!commandName) {
        const existingCmds = listStickerCommands()
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴛᴏ ᴄᴏᴍᴍᴀɴᴅ*\n\n`
        txt += `> Responder sticker + tipo comando que quiere ser atajo.

`
        txt += `*Ejemplo:*
`
        txt += `> Responder a la sticker, y luego escribir:
`
        txt += `> \`.addcmdsticker menu\`\n\n`
        
        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *ACTIVO* 」\n`
            for (const cmd of existingCmds.slice(0, 10)) {
                txt += `┃ 🖼️ → \`${cmd.command}\`\n`
            }
            if (existingCmds.length > 10) {
                txt += `┃ ...y ${existingCmds.length - 10} más
`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        
        return m.reply(txt)
    }
    
    // Validación del sticker respondido
    if (!m.quoted) {
        return m.reply("⚠️ *Reply sticker* ¡Es un comando!")
    }
    
    const stickerHash = getQuotedStickerHash(m)
    if (!stickerHash) {
        return m.reply("⚠️ Mensaje no devuelto *sticker*!")
    }
    
    // Validación de que el comando exista
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = getPlugin(cleanCmd)
    
    if (!plugin) {
        return m.reply(
            `❌ Command \`${cleanCmd}¡\` no encontrado!

` +
            `> Asegúrese de que el comando que desea convertir en un atajo es válido.`
        )
    }
    
    // Add sticker command
    const success = addStickerCommand(stickerHash, cleanCmd, m.sender)
    
    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *sticker de comando se añadió*

` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `¡Envía el sticker para ejecutar el comando!`
        )
    } else {
        await m.reply("❌ ¡No se pudo save sticker command!")
    }
}

export { pluginConfig as config, handler }
