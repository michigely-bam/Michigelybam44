import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-namadev',
    alias: ['setnamadev', 'setnamedev', 'gantideveloper'],
    category: 'owner',
    description: "Rename developer in config.js",
    usage: ".ganti-namadev <nombre_nuevo>",
    example: '.ganti-namadev Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, config }) {
    const newName = m.args.join(' ')
    
    if (!newName) {
        return m.reply(`👨‍💻 *cambió el nombre del desarrollador*

> Nombre actual: *${config.bot?.developer || '-'}*

*Uso:*
\`${m.prefix}ganti-namadev Nuevo nombre\``)
    }
    
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')
        
        configContent = configContent.replace(
            /developer:\s*['"]([^'"]*)['"]/,
            `developer: '${newName}'`
        )
        
        fs.writeFileSync(configPath, configContent)
        
        config.bot.developer = newName
        
        m.reply(`✅ *correcto*

> Nombre de desarrollador reemplazado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
