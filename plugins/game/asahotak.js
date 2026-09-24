import { games } from '../../src/lib/ourin-games.js'

games.register('asahotak', {
    alias: ['asah', 'quiz'],
    emoji: '🧠',
    title: "DESAFÍO MENTAL",
    description: "Afilador de cerebro juego - Adivina la respuesta"
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('asahotak')
export { pluginConfig as config, handler, answerHandler }
