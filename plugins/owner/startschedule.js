import { startSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import { initSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'startschedule',
    alias: ['startscheduler', 'schedstart', 'resumeschedule'],
    category: 'owner',
    description: "Reinicie un agendador particular o todo",
    usage: ".startchedule < nombre xen124; all ",
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

*Usage:*
\`.inicios de sesión Nombre\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`sholat\` - Sholat Scheduler
• \`all\` - Todo el schedler.

*Example:*
\`.startschedule sholat\`
\`.startschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = getDatabase();
            const wasEnabled = db.setting('autoSholat');
            
            if (wasEnabled) {
                await m.reply(`ℹ# El programador de oración está en estado activo #`);
                return;
            }
            
            initSholatScheduler(sock);
            db.setting('autoSholat', true);
            
            await m.reply(`▶️ *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪᴍᴜʟᴀɪ*

> Scheduler: *Sholat Scheduler*
> Status: ✅ Aktif

_La notificación de tiempo de presentación se enviará al grupo que activa esta función_`);
            return;
        }
        
        if (target === 'all') {
            initSholatScheduler(sock);
            const db = getDatabase();
            db.setting('autoSholat', true);
        }
        
        const result = startSchedulerByName(target, sock);
        
        if (result.started) {
            await m.reply(`▶️ *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪᴍᴜʟᴀɪ*

> Scheduler: *${result.name}*
> Status: ✅ Aktif

_El programador ha comenzado de nuevo_`);
        } else {
            await m.reply(`❌ El programador no se encuentra o ya está activo

Gunakan \`.startschedule\` para ver la lista del programador`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }