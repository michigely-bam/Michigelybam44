import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { stopSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: "Detenga a un determinado programador o todo",
    usage: '.stopschedule <nombre|all>',
    example: '.stopschedule sholat',
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
            const helpText = `🛑 *sᴛᴏᴘ sᴄʜᴇᴅᴜʟᴇʀ*

*Uso:*
\`.stopschedule <nombre|all>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio diario del límite
• \`groupschedule\` - Horarios de grupos
• \`sewa\` - Comprobación de alquileres
• \`messages\` - Mensajes programados
• \`sholat\` - Horarios de oración
• \`all\` - Todos los programadores

*Ejemplos:*
\`.stopschedule sholat\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (!wasEnabled) {
                await m.reply(`ℹ️ El programador de horarios de oración ya está detenido.`);
                return;
            }
            
            stopSholatScheduler();
            db.setting('autoSholat', false);
            
            await m.reply(`🛑 *PROGRAMADOR DETENIDO*

> Programador: *Horarios de oración*
> Estado: ❌ Detenido

_Usa \`.startschedule sholat\` para reactivarlo._`);
            return;
        }
        
        if (target === 'all') {
            stopSholatScheduler();
            const db = getDatabase();
            db.setting('autoSholat', false);
        }
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *PROGRAMADOR DETENIDO*

> Programador: *${result.name}*
> Estado: ❌ Detenido

_Usa \`.startschedule ${target}\` para reactivar_`);
        } else {
            await m.reply(`❌ El programador no existe o ya está detenido.

Usa \`.stopschedule\` para ver la lista de programadores.`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
