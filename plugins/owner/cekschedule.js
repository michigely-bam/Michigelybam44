import { getFullSchedulerStatus, formatTimeRemaining, getMsUntilTime } from '../../src/lib/ourin-scheduler.js'
import { initSholatScheduler, stopSholatScheduler } from '../../src/lib/ourin-sholat-scheduler.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { getTodaySchedule, extractPrayerTimes } from '../../src/lib/ourin-sholat-api.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'cekschedule',
    alias: ['cekscheduler', 'schedulerstatus', 'schedstatus'],
    category: 'owner',
    description: "Ver el estado de todos los horarios de arranque",
    usage: '.cekschedule',
    example: '.cekschedule',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const status = getFullSchedulerStatus();
        const db = getDatabase();
        const sholatEnabled = db.setting('autoSholat') || false;

        let text = `📊 *sᴄʜᴇᴅᴜʟᴇʀ sᴛᴀᴛᴜs*\n\n`;

        for (const sched of status.schedulers) {
            const statusIcon = sched.running ? '✅' : '❌';
            text += `${statusIcon} *${sched.name}*\n`;
            text += `   └ Key: \`${sched.key}\`\n`;
            text += `   └ ${sched.description}\n`;

            if (sched.lastRun && sched.lastRun !== '-' && sched.lastRun !== 'Never') {
                text += `   └ Last: ${sched.lastRun}\n`;
            }

            if (sched.stats) {
                if (sched.stats.totalResets) {
                    text += `   └ Total Resets: ${sched.stats.totalResets}\n`;
                }
                if (sched.stats.activeMessages !== undefined) {
                    text += `   └ Active: ${sched.stats.activeMessages} | Sent: ${sched.stats.totalSent}\n`;
                }
            }
            text += `\n`;
        }

        const sholatIcon = sholatEnabled ? '✅' : '❌';
        text += `${sholatIcon} *Programador de oraciones*\n`;
        text += `   └ Key: \`sholat\`\n`;
        text += `   └ Notificación del tiempo de oración (hora de la realidad)
`;

        if (sholatEnabled) {
            const kotaSetting = db.setting('autoSholatKota') || { id: '1301', nama: "CIUDAD DE YAKARTA" };
            text += `   └ Ubicación: ${kotaSetting.nama}\n`;

            try {
                const { schedule } = await getTodaySchedule(kotaSetting.id);
                const times = extractPrayerTimes(schedule);
                const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                let nextSholat = null;
                let nextTime = null;

                for (const [name, time] of Object.entries(times)) {
                    if (time > currentTime && time !== '-') {
                        nextSholat = name.charAt(0).toUpperCase() + name.slice(1);
                        nextTime = time;
                        break;
                    }
                }

                if (!nextSholat) {
                    nextSholat = 'Imsak';
                    nextTime = times.imsak;
                }

                text += `   └ Next: ${nextSholat} (${nextTime} WIB)\n`;
            } catch {
                text += `   └ _No se pudo load schedule_
`;
            }
        }

        text += `\n`;
        text += `━━━━━━━━━━━━━━━━━━━\n`;
        text += `✅ Activo: ${status.summary.totalActive + (sholatEnabled ? 1 : 0)}\n`;
        text += `❌ Inactivo: ${status.summary.totalInactive + (!sholatEnabled ? 1 : 0)}\n\n`;

        text += `> Usa \`.stopschedule <key>\` para detener
`;
        text += `> Usa \`.startschedule <key>\` para iniciar`;

        await m.reply(text);
    } catch (error) {
        console.error('[CekSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
