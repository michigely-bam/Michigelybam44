import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'nomerhoki',
    alias: ['nomorhoki', 'ceknomor'],
    category: 'primbon',
    description: "Control de suerte de HP",
    usage: ".nomerhoki <número>",
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
        return m.reply(`🍀 *número de la suerte*

> Introduzca el número de HP

\`Ejemplo: ${m.prefix}nomerhoki 6281234567890\``)
    }
    
    m.react('🍀')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/nomorhoki?phoneNumber=${nomor}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *falló*

> Fallado para analizar número`)
        }
        
        const r = data.data
        const ep = r.energi_positif.details
        const en = r.energi_negatif.details
        
        const response = `🍀 *NÚMERO DE LA SUERTE*\n\n` +
            `> Número: *${r.nomor}*\n\n` +
            `📊 *NÚMERO BAGUA:* ${r.angka_bagua_shuzi.value}%\n\n` +
            `✅ *ENERGÍA POSITIVA:* ${r.energi_positif.total}%\n` +
            `├ Riqueza: ${ep.kekayaan}\n` +
            `├ Salud: ${ep.kesehatan}\n` +
            `├ Cinta: ${ep.cinta}\n` +
            `└ Estabilidad: ${ep.kestabilan}\n\n` +
            `❌ *ENERGÍA NEGATIVA:* ${r.energi_negatif.total}%\n` +
            `├ Conflictos: ${en.perselisihan}\n` +
            `├ Pérdidas: ${en.kehilangan}\n` +
            `├ Desgracias: ${en.malapetaka}\n` +
            `└ Ruina: ${en.kehancuran}\n\n` +
            `> Status: ${r.analisis.status ? "✅ BUENA SUERTE" : "❌ NO ES SUERTE"}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
