import { pixa } from '../../src/scraper/removebackground.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'removebg',
    alias: ['rmbg', 'nobg', 'hapusbg'],
    category: 'tools',
    description: "Eliminación de fondo de imagen",
    usage: ".removebg (respuesta a la imagen)",
    example: '.removebg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const isImage = m.isImage || (m.quoted && m.quoted.isImage);
        if (!isImage) {
            return await m.reply("❌ *imágenes necesarios*\n\n> Responder o enviar una imagen con descripción .removebg");
        }
        
        await m.react('🕕')
        
        let mediaBuffer;
        if (m.isImage && m.download) {
            mediaBuffer = await m.download();
        } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
            mediaBuffer = await m.quoted.download();
        } else {
            return await m.reply("❌ No se pudo download image");
        }
        
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            return await m.reply("❌ Buffer de imagen inválida");
        }
        const pathnya = path.join(process.cwd(), 'temp', `rmbg_${Date.now()}.jpg`);
        fs.writeFileSync(pathnya, mediaBuffer);
        const result = await pixa(pathnya);
        
        await sock.sendMessage(m.chat, {
            image: result,
            caption: `✅ *fondo eliminado*

> Imagen de fondo eliminada con éxito`
        }, { quoted: m });
        try {
            fs.unlinkSync(pathnya);
        } catch (e) {}
    } catch (error) {
        console.error('[RemoveBG Error]', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }