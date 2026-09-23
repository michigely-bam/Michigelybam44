/**
 * @file plugins/tools/imgtoprompt.js
 * @description Plugin untuk mengubah gambar menjadi prompt AI
 */

import imgtoprompt from '../../src/scraper/img2prompt.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'imgtoprompt',
    alias: ['img2prompt', 'imagetoprompt', 'i2p'],
    category: 'tools',
    description: 'Mengubah gambar menjadi prompt AI',
    usage: '.imgtoprompt (reply gambar)',
    example: '.imgtoprompt',
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
            return await m.reply("❌ *ɢᴀᴍʙᴀʀ ᴅɪʙᴜᴛᴜʜᴋᴀɴ*\n\n> Responder o enviar una imagen con descripción .imgtoprompt");
        }
        
        await m.reply("🕕 *ᴍᴇᴍᴘʀᴏsᴇs ɢᴀᴍʙᴀʀ...*\n\n> Analizar imágenes para producir prompt");
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
        const tmpDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        
        const tmpFile = path.join(tmpDir, `img2prompt_${Date.now()}.webp`);
        fs.writeFileSync(tmpFile, mediaBuffer);
        const result = await imgtoprompt(tmpFile);
        try {
            fs.unlinkSync(tmpFile);
        } catch (e) {}
        if (result.status === 'eror' || !result.prompt) {
            return await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.msg || "Incapaz de generar prompt de esta imagen"}`);
        }
        const responseText = `🎨 *ɪᴍᴀɢᴇ ᴛᴏ ᴘʀᴏᴍᴘᴛ*\n\n` +
            `\`\`\`${result.prompt}\`\`\`\n\n` +
            `> _Generated at: ${result.generatedAt || new Date().toISOString()}_`;
        await m.reply(responseText);
    } catch (error) {
        console.error('[ImgToPrompt Error]', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }