import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'notifsholat',
    alias: ['notifsolat'],
    category: 'group',
    description: "Reducir las notificaciones de oración para este grupo",
    usage: '.notifsholat on/off',
    example: '.notifsholat on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Sólo administración de grupo puede utilizar esta característica`);
    }

    const args = m.args[0]?.toLowerCase();
    const group = db.getGroup(m.chat) || {};
    const globalDb = getDatabase();
    const kotaSetting = globalDb.setting('autoSholatKota') || { nama: "CIUDAD DE YAKARTA" };

    if (!['on', 'off'].includes(args)) {
        const isGlobalActive = globalDb.setting('autoSholat') || false;
        const statusGlobal = isGlobalActive ? "✅ ACTIVO" : "❌ INACTIVO";
        const statusGrup = group.notifSholat !== false ? "✅ ACTIVO" : "❌ INACTIVO";
        
        return m.reply(
            `🕌 *RECORDATORIO DEL TIEMPO DE LA ORACIÓN*

` +
            `Status Global: *${statusGlobal}*(De su propietario)
` +
            `Estatus de grupo: *${statusGrup}*\n` +
            `Ubicación: *${kotaSetting.nama}*\n\n` +
            `*AJUSTES DE GRUPO:*
` +
            `• *${m.prefix}notifsholat on* — Activar notificaciones en este grupo
` +
            `• *${m.prefix}notifsholat off* — Desactiva los avisos en este grupo

` +
            `*CÓMO FUNCIONA:*
` +
            `1. Envíe mp3 llamada a la oración & imágenes del calendario al entrar a la hora de la oración
` +
            `2. Seguir el calendario en tiempo real de myquran.com
` +
            `3. Si el estado global está INACTIVO, el grupo no recibirá la llamada a la oración aunque el estado del grupo esté ACTIVO.
` +
            `4. Si el grupo se siente perturbado, el administrador puede desactivar específicamente para este grupo.`
        );
    }

    if (args === 'on') {
        group.notifSholat = true;
        db.setGroup(m.chat, group);
        return m.reply(`✅ *RECORDATORIOS DE ORACIÓN ACTIVADOS*

> Este grupo recibirá un recordatorio de tiempo de oración
> Ubicación: ${kotaSetting.nama}`);
    }

    if (args === 'off') {
        group.notifSholat = false;
        db.setGroup(m.chat, group);
        return m.reply(`❌ *notificación de oración desactivada*`);
    }
}

export { pluginConfig as config, handler }
