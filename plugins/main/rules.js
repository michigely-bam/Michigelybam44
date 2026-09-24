import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'rules',
    alias: ['aturanbot', 'botrules'],
    category: 'main',
    description: "Muestra las reglas del bot",
    usage: '.rules',
    example: '.rules',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_BOT_RULES = [
    "No el comando de spam",
    "Usar características sabiamente",
    "Está prohibido usar indebidamente el bot",
    "Respeta a los demás usuarios",
    "Reportar errores al propietario",
    "No solicite características extrañas",
    "Bot no es 24 / 7, hay mantenimiento"
]

async function handler(m, { sock, config: botConfig }) {
    try {
        const db = getDatabase()
        const customRules = db.setting('botRules')

        let rulesList = DEFAULT_BOT_RULES

        if (customRules) {
            rulesList = customRules
                .split('\n')
                .map(v => v.replace(/^[^a-zA-Z0-9]+/, '').trim())
                .filter(Boolean)
        }

        const tableData = rulesList.map((rule, i) => [
            `${i + 1}`,
            rule
        ])

        await sock.sendTable(
            m.chat,
            "📜 Reglas del bot",
            ['No', 'Rule'],
            tableData,
            m,
            {
                headerText: `${botConfig.bot?.name || 'Ourin-AI'} *RULES*`,
                footer: "Foul puede resultar en prohibida / patada!"
            }
        )
    } catch (e) {
        m.reply("Se produjo un error al tomar las reglas")
    }
}

export { pluginConfig as config, handler }
