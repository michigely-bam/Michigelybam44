import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setintro',
    alias: ['setperkenalan', 'introset'],
    category: 'group',
    description: "Establecer el mensaje de entrada del grupo (sólo de administrador)",
    usage: ".setintro   mensaje >",
    example: ".Setintro ¡Bienvenido, @user, a @group!",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()
    
    if (!introText) {
        return m.reply(
            `📝 *sᴇᴛ ɪɴᴛʀᴏ*\n\n` +
            `¡Entra un mensaje de introducción!

` +
            `*Placeholder disponible:*
` +
            `> @user - Nombre de usuario
` +
            `> @group - Nombre del grupo
` +
            `> @count - Número de miembros
` +
            `> @date - fecha actual
` +
            `> @time - La hora actual
` +
            `> @desc - Descripción del grupo
` +
            `> @botname - Nombre del bot

` +
            `*Ejemplo:*
` +
            `> .setintro ¡Bienvenido, @user, al grupo @group! 👋`
        )
    }
    
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ᴅɪsᴀᴠᴇ!*\n` +
        `El mensaje de la introducción del grupo fue cambiado.
` +
        `Escribe *${m.prefix}intro*para ver los resultados.`
    )
}

export { pluginConfig as config, handler }
