import FormData from 'form-data'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'transkrip',
    alias: ['stt', 'speechtotext', 'transcribe'],
    category: 'tools',
    description: "Convierte la nota de voz / audio en texto (Speech-to-Text)",
    usage: '.transkrip (responde a una nota de voz)',
    example: '.transkrip',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
};
function convertToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        exec(
            `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -f wav "${outputPath}"`,
            { timeout: 30000 },
            (err) => err ? reject(err) : resolve()
        );
    });
}
async function transcribeWithGroq(audioBuffer, apiKey) {
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
    form.append('model', 'whisper-large-v3');
    form.append('language', 'id');
    form.append('response_format', 'json');
    const { data } = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000,
        maxContentLength: Infinity
    });
    return data.text || '';
}
async function handler(m, { sock }) {
    const quoted = m.quoted || m;
    const isAudio = quoted.type === 'audioMessage' || /audio/.test(quoted.mimetype || '');
    if (!isAudio) {
        return m.reply(
            `🎤 *TRANSCRIPCIÓN*

` +
            `> Responder notas de voz o audio para convertirlas en texto
` +
            `> Ejemplo: respuesta VN → escribir \`${m.prefix}transkrip\``
        );
    }
    const groqKey = config.APIkey?.groq;
    if (!groqKey) {
        return m.reply(
            `❌ *ERROR*\n\n` +
            `> La clave API de Groq no está configurada
` +
            `> Configúralo en config.js → APIkey.groq
` +
            `> Consíguela gratis en https://console.groq.com`
        );
    }
    m.react('🎤');
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const inputFile = path.join(tmpDir, `stt_${Date.now()}.ogg`);
    const wavFile = path.join(tmpDir, `stt_${Date.now()}.wav`);
    try {
        const buffer = await quoted.download();
        if (!buffer || buffer.length < 1000) {
            m.react('❌');
            return m.reply("❌ Audio demasiado pequeño o falló en descargar");
        }
        fs.writeFileSync(inputFile, buffer);
        await convertToWav(inputFile, wavFile);
        const wavBuffer = fs.readFileSync(wavFile);
        const text = await transcribeWithGroq(wavBuffer, groqKey);
        if (!text || text.trim() === '') {
            m.react('❌');
            return m.reply("❌ Incapaz de detectar el sonido. Asegúrese de que el audio sea claro y no demasiado corto.");
        }
        const duration = Math.ceil(buffer.length / 4000);
        await m.reply(
            `🎤 *TRANSCRIPCIÓN*

` +
            `╭┈┈⬡「 📝 *RESULTADO* 」\n` +
            `┃\n` +
            `┃ ${text}\n` +
            `┃\n` +
            `╰┈┈⬡\n\n` +
            `> 🤖 Model: Whisper Large V3\n` +
            `> 🌐 Idioma: indonesio
` +
            `> 📊 Tamaño: ~${(buffer.length / 1024).toFixed(1)} KB`
        );
        m.react('✅');
    } catch (error) {
        m.react('❌');
        if (error.response?.status === 401) {
            return m.reply("❌ La clave de Groq no es válida. Revisa config.js → APIkey.groq");
        }
        if (error.response?.status === 429) {
            return m.reply("❌ - Inténtalo de nuevo más tarde.");
        }
        m.reply(te(m.prefix, m.command, m.pushName));
    } finally {
        [inputFile, wavFile].forEach(f => { try { fs.unlinkSync(f); } catch {} });
    }
}
export { pluginConfig as config, handler }
