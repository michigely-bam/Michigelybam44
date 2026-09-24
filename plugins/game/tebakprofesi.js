import { games } from '../../src/lib/ourin-games.js'

games.register('tebakprofesi', {
    alias: ['tp', 'guessjob'],
    emoji: '👨‍💼',
    title: "ADIVINA LA PROFESIÓN",
    description: "Adivina el nombre de la profesión"
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakprofesi')
export { pluginConfig as config, handler, answerHandler }
