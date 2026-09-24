const pluginConfig = {
    name: 'close',
    alias: ['tutup', 'closegroup', 'tutupgroup'],
    category: 'group',
    description: "Cerrar el grupo para que sólo admin pueda chatear",
    usage: '.close',
    example: '.close',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (groupMeta.announce) {
            await m.reply(
                `⚠️ *validación fallida*

` +
                `> El grupo ya está \`cerrado\`.
` +
                `Sólo los administradores pueden enviar mensajes.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} ha cerrado este grupo`;
        
        await m.reply(successMsg, {mentions: [m.sender]})
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `El fracaso en cerrar el grupo.
` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
