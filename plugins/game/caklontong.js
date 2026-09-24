import { games } from '../../src/lib/ourin-games.js'

games.register('caklontong', {
    alias: ['cak', 'lontong'],
    emoji: '🤔',
    title: "ADIVINANZAS CAK LONTONG",
    description: "El juego se llama putt - una respuesta de diez centavos"
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('caklontong')
export { pluginConfig as config, handler, answerHandler }
