import { games } from '../../src/lib/ourin-games.js'

games.register('tebaknegara', {
    alias: ['tn', 'guesscountry'],
    emoji: '🌍',
    title: 'TEBAK NEGARA',
    description: "Adivina el nombre del país."
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaknegara')
export { pluginConfig as config, handler, answerHandler }
