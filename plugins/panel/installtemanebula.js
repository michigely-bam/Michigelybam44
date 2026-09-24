import { Client } from 'ssh2'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'installtemanebula',
    alias: ['installthemanebula', 'temanebula', 'nebulatheme'],
    category: 'panel',
    description: "Instala el tema Nebula (Bottom de Belleza) para paneles de Pterodactilo a través de SSH",
    usage: '.installtemanebula <ip>|<password>',
    example: '.installtemanebula 192.168.1.1|secretpass',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const CMD_DEPS = `
apt-get update -qq && \
apt-get install -y curl wget unzip git zip gnupg ca-certificates -qq && \
mkdir -p /etc/apt/keyrings && \
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -yes -o /etc/apt/keyrings/nodesource.gpg && \
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
apt-get update -qq && \
apt-get install -y nodejs -qq && \
npm i -g yarn && \
cd /var/www/pterodactyl && yarn install
`

const CMD_BLUEPRINT = `
cd /var/www/pterodactyl && \
wget "$(curl -s https://api.github.com/repos/BlueprintFramework/framework/releases/latest | grep 'browser_download_url' | grep 'release.zip' | cut -d '"' -f 4)" -O release.zip && \
unzip -o release.zip && \
rm release.zip && \
touch .blueprintrc && \
echo 'WEBUSER="www-data";\nOWNERSHIP="www-data:www-data";\nUSERSHELL="/bin/bash";' > .blueprintrc && \
chmod +x blueprint.sh && \
bash blueprint.sh
`

const CMD_NEBULA = `
cd /var/www/pterodactyl && \
wget -q -O nebula.blueprint "https://github.com/FikXzModzDeveloper/Nebula-Theme-pterodactyl/raw/main/nebula.blueprint" && \
if command -v blueprint &> /dev/null; then \
    printf "\\n\\n" | blueprint -install nebula; \
else \
    printf "\\n\\n" | bash blueprint.sh -install nebula; \
fi
`

function execSSH(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, { pty: true }, (err, stream) => {
            if (err) return reject(err)
            let output = ''
            stream.on('close', (code, signal) => {
                if (code !== 0) return reject(new Error(`El comando falló con el código ${code}\nSalida: ${output}`))
                resolve(output)
            })
            stream.on('data', d => { output += d.toString() })
            stream.stderr.on('data', d => { output += d.toString() })
        })
    })
}

function handler(m) {
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `╭┈┈⬡「 🌌 *ɪɴsᴛᴀʟʟ ᴛᴇᴍᴀ ɴᴇʙᴜʟᴀ* 」
┃ ㊗ USO: \`${m.prefix}installtemanebula <ip>|<password>\`\n╰┈┈⬡\n\n> \`Ejemplo: ${m.prefix}installtemanebula 192.168.1.1|secretpass\``
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
            await m.reply(`🕕 *[1/3] ᴘʀᴇᴘᴀʀɪɴɢ ᴇɴᴠɪʀᴏɴᴍᴇɴᴛ...*

> Instala Node.js 22, Yarn y dependientes...`)
            await execSSH(conn, CMD_DEPS)

            await m.reply(`🕕 *[2/3] INSTALANDO BLUEPRINT...*

> Descargando y configurando Blueprint Framework...`)
            await execSSH(conn, CMD_BLUEPRINT)

            await m.reply(`🕕 *[3/3] INSTALANDO NEBULA...*\n\n> Instalando el tema Nebula (confirmación automática)...`)
            await execSSH(conn, CMD_NEBULA)

            m.react('✅')
            await m.reply(
                `╭┈┈⬡「 ✅ *TEMA NEBULA* 」\n┃ ㊗ ᴇsᴛᴀᴅᴏ: *Instalado*\n┃ ㊗ ɪᴘ: ${ipvps}
╰┈┈⬡

> _Nebula tema instalado con éxito!_`
            )
        } catch (err) {
            console.error('[Nebula Install Error]', err)
            m.react('☢')
            m.reply(te(m.prefix, m.command, m.pushName))
        } finally {
            conn.end()
        }
    }).on('error', (err) => {
        console.error('[SSH Error]', err)
        m.react('❌')
        m.reply(`❌ ¡La conexión falló!

> IP inválida o contraseña / VPS abajo.`)
    }).connect(connSettings)
}

export { pluginConfig as config, handler }
