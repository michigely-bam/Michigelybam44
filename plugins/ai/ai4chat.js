import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const configuracionPlugin = {
    name: 'ai4chat',
    alias: ['ai'],
    category: 'ai',
    description: 'Chatea con AI4Chat',
    usage: '.ai4chat <pregunta>',
    example: '.ai4chat ¿Qué es JavaScript?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function controlador(m) {
    const texto = m.text

    if (!texto) {
        return m.reply(`🤖 *ᴀɪᴄʜᴀᴛ*\n\n> Introduce una pregunta\n\n\`Ejemplo: ${m.prefix}ai4chat ¿Qué es JavaScript?\``)
    }

    m.react('🕕')

    try {
        const datos = await f(`https://api.zenzxz.my.id/ai/copilot?message=${encodeURIComponent(texto)}&model=gpt-5`)

        m.react('✅')

        await m.reply(`${datos.result.text}`)
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { configuracionPlugin as config, controlador as handler }
