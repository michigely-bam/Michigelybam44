import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { stopSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: "Detenga a un determinado programador o todo",
    usage: ".stopschedule - Nombre Az 124; all ",
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

*Usage:*
\`.stopschedule\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`sholat\` - Sholat Scheduler
• \`all\` - Todo el schedler.

*Example:*
\`.stopschedule sholat\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (!wasEnabled) {
                await m.reply(`ℹ*El programador de oración está en un estado no activo*`);
                return;
            }
            
            stopSholatScheduler();
            db.setting('autoSholat', false);
            
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *Sholat Scheduler*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule sholat\` para reactivar_`);
            return;
        }
        
        if (target === 'all') {
            stopSholatScheduler();
            const db = getDatabase();
            db.setting('autoSholat', false);
        }
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule ${target}\` para reactivar_`);
        } else {
            await m.reply(`❌ No se ha encontrado ni ha sido discapacitado

Gunakan \`.stopschedule\` para ver la lista del programador`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }