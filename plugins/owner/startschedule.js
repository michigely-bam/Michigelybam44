import { startSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { initSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'startschedule',
    alias: ['startscheduler', 'schedstart', 'resumeschedule'],
    category: 'owner',
    description: "Reinicie un agendador particular o todo",
    usage: '.startschedule <nombre|all>',
    example: '.startschedule sholat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();
        
        if (!target) {
            const helpText = `▶️ *sᴛᴀʀᴛ sᴄʜᴇᴅᴜʟᴇʀ*

*Uso:*
\`.startschedule <nombre|all>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio diario del límite
• \`groupschedule\` - Horarios de grupos
• \`sewa\` - Comprobación de alquileres
• \`messages\` - Mensajes programados
• \`sholat\` - Horarios de oración
• \`all\` - Todos los programadores

*Ejemplos:*
\`.startschedule sholat\`
\`.startschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (wasEnabled) {
                await m.reply(`ℹ️ El programador de horarios de oración ya está activo.`);
                return;
            }
            
            initSholatScheduler(sock);
            db.setting('autoSholat', true);
            
            await m.reply(`▶️ *PROGRAMADOR INICIADO*

> Programador: *Horarios de oración*
> Estatus: ✅ Activo

_Las notificaciones de horarios de oración se enviarán al grupo que activó esta función._`);
            return;
        }
        
        if (target === 'all') {
            initSholatScheduler(sock);
            const db = getDatabase();
            db.setting('autoSholat', true);
        }
        
        const result = startSchedulerByName(target, sock);
        
        if (result.started) {
            await m.reply(`▶️ *PROGRAMADOR INICIADO*

> Programador: *${result.name}*
> Estatus: ✅ Activo

_El programador se ha iniciado de nuevo._`);
        } else {
            await m.reply(`❌ El programador no existe o ya está activo.

Usa \`.startschedule\` para ver la lista de programadores.`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
