import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'nomerhoki',
    alias: ['nomorhoki', 'ceknomor'],
    category: 'primbon',
    description: "Control de suerte de HP",
    usage: ".Número",
    example: '.nomerhoki 6281234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let nomor = m.args.join('').replace(/[^0-9]/g, '')
    if (!nomor) {
        return m.reply(`🍀 *ɴᴏᴍᴏʀ ʜᴏᴋɪ*

> Introduzca el número de HP

\`Contoh: ${m.prefix}nomerhoki 6281234567890\``)
    }
    
    m.react('🍀')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/nomorhoki?phoneNumber=${nomor}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*

> Fallado para analizar número`)
        }
        
        const r = data.data
        const ep = r.energi_positif.details
        const en = r.energi_negatif.details
        
        const response = `🍀 *ɴᴏᴍᴏʀ ʜᴏᴋɪ*\n\n` +
            `> Nomor: *${r.nomor}*\n\n` +
            `📊 *ᴀɴɢᴋᴀ ʙᴀɢᴜᴀ:* ${r.angka_bagua_shuzi.value}%\n\n` +
            `✅ *ᴇɴᴇʀɢɪ ᴘᴏꜱɪᴛɪꜰ:* ${r.energi_positif.total}%\n` +
            `├ Kekayaan: ${ep.kekayaan}\n` +
            `├ Kesehatan: ${ep.kesehatan}\n` +
            `├ Cinta: ${ep.cinta}\n` +
            `└ Kestabilan: ${ep.kestabilan}\n\n` +
            `❌ *ᴇɴᴇʀɢɪ ɴᴇɢᴀᴛɪꜰ:* ${r.energi_negatif.total}%\n` +
            `├ Perselisihan: ${en.perselisihan}\n` +
            `├ Kehilangan: ${en.kehilangan}\n` +
            `├ Malapetaka: ${en.malapetaka}\n` +
            `└ Kehancuran: ${en.kehancuran}\n\n` +
            `> Status: ${r.analisis.status ? '✅ HOKI' : '❌ TIDAK HOKI'}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }