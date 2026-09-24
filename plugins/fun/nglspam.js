import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: ['nglspam'],
    alias: ['spamngl'],
    category: 'tools',
    description: "Generar imágenes NGL",
    usage: '.nglspam <usuario>|<mensaje>|<cantidad>',
    example: '.nglspam Zann|Hola|33',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const [username, pesan, jumlah] = m.text.split('|')
    
    if (!text) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}spamngl <usuario>|<mensaje>|<cantidad>\`\n\n` +
            `> Ejemplo: \`${m.prefix}spamngl Zann|Haii|33\``
        )
    }
    
    await m.react('🕕')
    
    try {
        const apiUrl = `https://api.nexray.web.id/tools/spamngl?url=${encodeURIComponent('https://ngl.link/' + username)}&pesan=${encodeURIComponent(pesan)}&jumlah=${encodeURIComponent(jumlah)}`
        const data = await f(apiUrl)
        if(data.status){
            await m.reply('✅ Success spam ngl')
        }else{
            await m.reply('❌ No se pudieron enviar los mensajes NGL.')
        }
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
