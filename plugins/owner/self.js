import config from '../../config.js'
/**
 * @file plugins/owner/self.js
 *@description Plugin para activar el modo self (solo propietario & bot)
 */
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'self',
    alias: ['selfmode', 'private-mode'],
    category: 'owner',
    description: 'Activar el modo privado (solo el propietario y el propio bot tienen acceso)',
    usage: '.self',
    example: '.self',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
 *Handler para el autocomando
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply("🚫 *se rechazó el acceso*\n\n> ¡Sólo el propietario puede cambiar el modo robot!");
        }
        const currentMode = config.mode;
        if (currentMode === 'self') {
            return await m.reply("ℹBot ya está en modo *self*");
        }
        config.mode = 'self';
        const db = getDatabase();
        db.setting('botMode', 'self');
        
        const responseText = `🔒 *modo autoactivo*

` +
            `Los bots ahora sólo responden:
` +
            `> • Owner bot\n` +
            `> • El propio bot (fromMe)

` +
            `_Usa .public para abrir el acceso_`;
        await m.reply(responseText);
        console.log(`[Mode] Changed to SELF by ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Self Command Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validar al propietario con varias comprobaciones
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = m.sender?.replace(/[^0-9]/g, '') || '';
    const ownerNumbers = config.owner?.number || [];
    
    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });
    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

export { pluginConfig as config, handler }
