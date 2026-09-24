import { Client } from 'ssh2'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'installtemastellar',
    alias: ['installthemastellar', 'temastellar'],
    category: 'panel',
    description: "Instala el tema estelar para el panel de Pterodactyl a través de SSH",
    usage: '.installtemastellar <ip>|<password>',
    example: '.installtemastellar 192.168.1.1|secretpass',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const DEPS_CMD = 'apt-get update -y && apt-get install -y curl git && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs && npm i -g yarn && apt-get install -y composer'
const THEME_CMD = 'bash <(curl -s https://raw.githubusercontent.com/AnonGhostID/flavor/main/flavor.sh)'
const BUILD_CMD = 'cd /var/www/pterodactyl && composer install --no-dev --optimize-autoloader && yarn install && export NODE_OPTIONS=--openssl-legacy-provider && yarn build:production && php artisan view:clear && php artisan config:clear'

function execSSH(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, { pty: true }, (err, stream) => {
            if (err) return reject(err)
            let output = ''
            stream.on('close', () => resolve(output))
            stream.on('data', d => { output += d.toString() })
            stream.stderr.on('data', d => { output += d.toString() })
        })
    })
}

function handler(m) {
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `╭┈┈⬡「 🎨 *ɪɴsᴛᴀʟʟ ᴛᴇᴍᴀ sᴛᴇʟʟᴀʀ* 」
┃ ㊗ USO: \`${m.prefix}installtemastellar <ip>|<password>\`\n╰┈┈⬡\n\n> \`Ejemplo: ${m.prefix}installtemastellar 192.168.1.1|secretpass\``
        )
    }

    const parts = text.split('|')
    if (parts.length < 2) {
        return m.reply(`❌ ¡Formato inválido! \`ip|password\``)
    }

    const ipvps = parts[0].trim()
    const passwd = parts[1].trim()

    const connSettings = {
        host: ipvps,
        port: 22,
        username: 'root',
        password: passwd,
        readyTimeout: 30000
    }

    const conn = new Client()

    m.react('🕕')

    conn.on('ready', async () => {
        try {
            await m.reply(`🕕 *[1/3] INSTALANDO DEPENDENCIAS...*\n\n> Instalando Node.js, Yarn y Composer...`)
            await execSSH(conn, DEPS_CMD)

            await m.reply(`🕕 *[2/3] INSTALANDO TEMA...*\n\n> Descargando e instalando el tema Stellar...`)
            await execSSH(conn, THEME_CMD)

            await m.reply(`🕕 *[3/3] ʙᴜɪʟᴅ ᴀssᴇᴛs...*\n\n> Compiling panel assets...`)
            await execSSH(conn, BUILD_CMD)

            m.react('✅')
            await m.reply(
                `╭┈┈⬡「 ✅ *TEMA STELLAR* 」\n┃ ㊗ ᴇsᴛᴀᴅᴏ: *Instalado*\n┃ ㊗ ɪᴘ: ${ipvps}
╰┈┈⬡

> _Stellar + dependientes tema instalado con éxito!_`
            )
        } catch (err) {
            m.react('☢')
            m.reply(te(m.prefix, m.command, m.pushName))
        } finally {
            conn.end()
        }
    }).on('error', (err) => {
        m.react('❌')
        m.reply(`❌ ¡La conexión falló!

> IP o contraseña inválida.`)
    }).connect(connSettings)
}

export { pluginConfig as config, handler }
