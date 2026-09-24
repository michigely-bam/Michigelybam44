import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'savenomor',
    alias: ['sv', 'save', 'simpannomor'],
    category: 'pushkontak',
    description: 'Guardar un número de contacto',
    usage: '.savenomor <nombre> o .savenomor <numero>|<nombre>',
    example: '.savenomor JohnDoe',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    if (m.isGroup) {
        const groupMode = getGroupMode(m.chat, db)
        if (groupMode !== 'pushkontak' && groupMode !== 'all') {
            return m.reply(`❌ *modo no es adecuado*

> Activar el modo Pushcontack primero

\`${m.prefix}botmode pushkontak\``)
        }
    }
    
    let targetNumber = ''
    let nama = ''
    
    if (m.isGroup) {
        if (m.quoted) {
            targetNumber = m.quoted.sender
            nama = m.text?.trim()
        } else if (m.mentionedJid?.length) {
            targetNumber = m.mentionedJid[0]
            const input = m.text?.trim()
            nama = input?.split('|')[1]?.trim() || input?.replace(/@\d+/g, '').trim()
        } else if (m.text?.includes('|')) {
            const [num, nm] = m.text.split('|').map(s => s.trim())
            targetNumber = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            nama = nm
        } else {
            return m.reply(
                `📱 *save el número*

` +
                `> En el grupo:
` +
                `┃ \`${m.prefix}savenomor nombre\` (respondiendo al mensaje)
` +
                `┃ \`${m.prefix}savenomor @mención|nombre\`\n` +
                `┃ \`${m.prefix}savenomor 628xxx|nombre\`\n\n` +
                `> En privado:\n` +
                `┃ \`${m.prefix}savenomor nombre\``
            )
        }
    } else {
        targetNumber = m.chat
        nama = m.text?.trim()
    }
    
    if (!nama) {
        return m.reply(`❌ *falló*

> Ingrese el nombre de contacto`)
    }
    
    if (!targetNumber) {
        return m.reply(`❌ *falló*

> Incapaz de determinar el número de destino`)
    }
    
    m.react('📱')
    
    try {
        const contactAction = {
            fullName: nama,
            lidJid: targetNumber,
            saveOnPrimaryAddressbook: true
        }
        
        await sock.addOrEditContact(targetNumber, contactAction)
        
        m.react('✅')
        await m.reply(
            `✅ *CONTACTO GUARDADO*

` +
            `> NÚMERO: \`${targetNumber.split('@')[0]}\`\n` +
            `> NOMBRE: \`${nama}\``
        )
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
