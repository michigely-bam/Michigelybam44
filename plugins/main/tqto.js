import config from '../../config.js'
import path from 'path'
import fs from 'fs'
const pluginConfig = {
    name: 'tqto',
    alias: ['thanksto', 'credits', 'kredit'],
    category: 'main',
    description: "Mostrar lista de los contribuyentes de bot",
    usage: '.tqto',
    example: '.tqto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = config.bot?.name || 'Ourin-AI'
    const version = config.bot?.version || '1.0.0'
    const developer = config.bot?.developer || 'Lucky Archz'
    
    const credits = [
        { name: 'hyuuOkkotsuX', role: 'Lead Staff', icon: '👨‍💻' },
        { name: 'Zann', role: 'Creador de Ourin MD y APK Stardem Ourin', icon: '👨‍💻' },
        { name: 'SenzOkkotsu', role: 'Asisstant Developer', icon: '👨‍💻' },
        { name: 'Ell', role: 'Asisstant Developer', icon: '👨‍💻' },
        { name: 'Aqell', role: 'Developer SC BUG Ourin Glitch', icon: '👨‍💻' },
        { name: 'Mobbc', role: 'Staff', icon: '👨‍💻' },
        { name: 'Sanxz', role: 'Colaborador principal', icon: '👨‍💻' },
        { name: 'Dinz', role: 'Colaborador principal', icon: '👨‍💻' },
        { name: 'Forone Store', role: 'Colaborador principal', icon: '🛒' },
        { name: 'Rakaa', role: 'Colaborador principal', icon: '🛒' },
        { name: 'Sabila', role: 'Colaboradora principal', icon: '👩‍💻' },
        { name: 'Syura Store', role: 'Colaboradora principal', icon: '👩‍💻' },
        { name: 'Xero', role: 'Colaboradora principal', icon: '👩‍💻' },
        { name: 'Lyoraaa', role: 'Owner', icon: '👩‍💻' },
        { name: 'Danzzz', role: 'Owner', icon: '👨‍💻' },
        { name: 'Muzan', role: 'Owner', icon: '👨‍💻' },
        { name: 'Gray', role: 'Owner', icon: '👨‍💻' },
        { name: 'Baim', role: 'Moderator', icon: '👨‍💻' },
        { name: 'Vadel', role: 'Moderator', icon: '👨‍💻' },
        { name: 'Fahmi', role: 'Moderator', icon: '👨‍💻' },
        { name: 'Caca', role: 'Moderator', icon: '👨‍💻' },
        { name: 'panceo', role: 'Partner', icon: '🛒' },
        { name: 'KingSatzID', role: 'Partner', icon: '🛒' },
        { name: 'Dashxz', role: 'Partner', icon: '🛒' },
        { name: 'This JanzZ', role: 'Partner', icon: '🛒' },
        { name: 'Ahmad', role: 'Partner', icon: '🛒' },
        { name: 'nopal', role: 'Partner', icon: '🛒' },
        { name: 'tuadit', role: 'Partner', icon: '🛒' },
        { name: 'andry', role: 'Partner', icon: '🛒' },
        { name: 'kingdanz', role: 'Partner', icon: '🛒' },
        { name: 'patih', role: 'Partner', icon: '🛒' },
        { name: 'Ryuu', role: 'Partner', icon: '🛒' },
        { name: 'Pororo', role: 'Partner', icon: '🛒' },
        { name: 'Janzz', role: 'Partner', icon: '🛒' },
        { name: 'Morvic', role: 'Partner', icon: '🛒' },
        { name: 'zylnzee', role: 'Partner', icon: '🛒' },
        { name: 'Farhan', role: 'Partner', icon: '🛒' },
        { name: 'Alizz', role: 'Partner', icon: '🛒' },
        { name: 'Kiram', role: 'Partner', icon: '🛒' },
        { name: 'Minerva', role: 'Partner', icon: '🛒' },
        { name: 'Riam', role: 'Partner', icon: '🛒' },
        { name: 'Febri', role: 'Partner', icon: '🛒' },
        { name: 'Kuze', role: 'Partner', icon: '🛒' },
        { name: 'Oscar Dani', role: 'Partner', icon: '🛒' },
        { name: 'Udun', role: 'Partner', icon: '🛒' },
        { name: 'Zanspiw', role: 'Youtuber', icon: '🌐' },
        { name: 'Danzz Nano', role: 'Youtuber', icon: '🌐' },
        { name: 'Otros YouTubers que hicieron reseñas', role: 'YouTuber', icon: '🌐' },
        { name: 'Todos ustedes', role: 'Los mejores', icon: '🌐' },
        { name: 'Open Source Community', role: 'Libraries & Tools', icon: '🌐' },

    ]
    
    const headers = ['No', "Nombre", 'Role / Tier']
    const rows = credits.map((c, i) => [i + 1, c.name, c.role])
    
    await sock.sendTable(m.chat, "OURIN TEAM", headers, rows, m, { 
        headerText: `${config.bot?.name}

- A continuación está la lista de personas que nos han ayudado con la fabricación de estos bots y nos han apoyado.
`, 
        footer: "\n*Gracias por apoyarnos hasta ahora: b*" 
    })
}

export { pluginConfig as config, handler }
