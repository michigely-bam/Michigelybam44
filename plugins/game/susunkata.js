import { games } from '../../src/lib/ourin-games.js'

games.register('susunkata', {
    alias: ['susun', 'scramble'],
    emoji: '🔠',
    title: "ORDENAR PALABRAS",
    description: "Ordena una palabra con las letras"
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('susunkata')
export { pluginConfig as config, handler, answerHandler }
