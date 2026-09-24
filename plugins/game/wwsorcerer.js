import { nightActionHandler } from './werewolf.js'
const pluginConfig = {
    name: 'wwsorcerer',
    alias: ['sorcerer', 'wws'],
    category: 'game',
    description: 'Acción nocturna del hechicero: comprobar si el objetivo es el vidente',
    usage: '.wwsorcerer <número>',
    example: '.wwsorcerer 3',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: true,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    return await nightActionHandler(m, { sock })
}

export { pluginConfig as config, handler }
