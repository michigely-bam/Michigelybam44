import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'jadwalgroup',
    alias: ['schedulegroup', 'jdwlgrup', 'autoopenclose'],
    category: 'group',
    description: "Grupo automático abierto / horario cerrado",
    usage: '.jadwalgroup <open/close> <HH:MM>',
    example: '.jadwalgroup open 06:00',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    const cleaned = timeStr.trim().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    
    return { hours, minutes };
}

function formatTime(hours, minutes) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase();
    
    let time = args[1];
    if (args.length >= 4 && args[2] === ':') {
        time = `${args[1]}:${args[3]}`;
    } else if (args.length >= 2) {
        time = args.slice(1).join('').replace(/\s+/g, '');
    }
    
    if (!action) {
        const group = db.getGroup(m.chat) || {};
        const openTime = group.scheduleOpen || null;
        const closeTime = group.scheduleClose || null;
        
        let scheduleInfo = `⏰ *cuadro de grupo*

「 📋 *sᴛᴀᴛᴜs* 」
🔓 ᴏᴘᴇɴ: *${openTime || "Inactivo"}*
🔒 ᴄʟᴏsᴇ: *${closeTime || "Inactivo"}*

*Modo de uso:*
\`.jadwalgroup open 06:00\`
\`.jadwalgroup close 22:00\`
\`.Grupo de promoción eliminar abierto\`
\`.Promotes\``;
        
        await m.reply(scheduleInfo);
        return;
    }
    
    if (action === 'hapus' || action === 'delete' || action === 'remove') {
        const type = args[1]?.toLowerCase();
        
        if (type !== 'open' && type !== 'close') {
            await m.reply(
                `⚠️ *validación fallida*

` +
                `> Utilice: \`.jadwalgroup hapus open\`
` +
                `> o: \`.jadwalgroup hapus close\``
            );
            return;
        }
        
        const group = db.getGroup(m.chat) || {};
        
        if (type === 'open') {
            delete group.scheduleOpen;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *correcto*

` +
                `> Se han eliminado los horarios *abiertos de grupos* automáticamente.`
            );
        } else {
            delete group.scheduleClose;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *correcto*

` +
                `> El calendario *de cierre automático del grupo* ha sido eliminado.`
            );
        }
        return;
    }
    
    if (action !== 'open' && action !== 'close') {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `¡La acción debe ser \`open\` o \`close\`!

` +
            `> *Ejemplo:*\n` +
            `> \`.jadwalgroup open 06:00\`\n` +
            `> \`.jadwalgroup close 22:00\``
        );
        return;
    }
    
    if (!time) {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `¡El tiempo debe llenarse!

` +
            `> *Formato:* \`HH:MM\` (24 horas)\n` +
            `> *Ejemplo:* \`.jadwalgroup ${action} 08:00\``
        );
        return;
    }
    
    const parsed = parseTime(time);
    if (!parsed) {
        await m.reply(
            `⚠️ *validación fallida*

` +
            `¡El formato de tiempo no es válido!

` +
            `> *Formato:* \`HH:MM\` (24 horas)\n` +
            `> *Ejemplo:* \`06:00\`, \`22:30\`, \`08:15\``
        );
        return;
    }
    
    const group = db.getGroup(m.chat) || {};
    const formattedTime = formatTime(parsed.hours, parsed.minutes);
    
    if (action === 'open') {
        group.scheduleOpen = formattedTime;
    } else {
        group.scheduleClose = formattedTime;
    }
    
    db.setGroup(m.chat, group);
    
    const actionText = action === 'open' ? "ABRIR" : "CERRAR";
    const emoji = action === 'open' ? '🔓' : '🔒';
    
    const successMsg = `✅ *el calendario se guarda*

╭┈┈⬡「 ⏰ *sᴇᴛᴛɪɴɢ* 」
┃ ㊗ ${emoji} ACCIÓN: *${actionText}*
┃ ㊗ ⏱️ HORA: *${formattedTime} WIB*
┃ 祝 📡 estado: *🟢 activo*
╰┈┈⬡

> _El grupo se ${action === 'open' ? 'abrirá' : 'cerrará'} automáticamente._
> _Todos los días en el reloj *${formattedTime}* WIB._`;
    
    await m.reply(successMsg);
}

export { pluginConfig as config, handler }
