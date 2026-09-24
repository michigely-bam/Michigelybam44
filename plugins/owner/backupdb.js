import { sendStoreBackup, SCHEMA_VERSION } from '../../src/lib/ourin-store-backup.js'
const pluginConfig = {
    name: 'backupdb',
    alias: ['dbbackup', 'backupstore', 'storebackup'],
    category: 'owner',
    description: "Base de datos de respaldo / almacenar y enviarlo al propietario",
    usage: '.backupdb',
    isOwner: true,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const backupContents = [
        "📁 database/*.json (todos los archivos JSON)",
        '📁 database/cpanel/* (data cPanel)',
        '📄 storage/database.json (main database)',
        '📄 db.json (root database)',
        '📄 database/main/*.json (main database)',
        '📋 backup_metadata.json (info schema)'
    ]
    
    await m.reply(
        `🕕 *Creando copia de seguridad de la base de datos...*

` +
        `╭┈┈⬡「 📦 *QUÉ INCLUYE LA COPIA DE SEGURIDAD* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )
    
    const result = await sendStoreBackup(sock)
    
    if (result.success) {
        await m.reply(
            `✅ ¡Un respaldo exitoso!

` +
            `📦 Size: ${result.size}\n` +
            `📁 Files: ${result.files}\n` +
            `🔖 Schema: v${SCHEMA_VERSION}\n\n` +
            `> Backup de tipo seguro, compatible con las próximas actualizaciones.
` +
            `Las copias de seguridad han sido enviadas al propietario principal.`
        )
    } else {
        await m.reply(`❌ El respaldo falló: ${result.error}`)
    }
}

export { pluginConfig as config, handler }
