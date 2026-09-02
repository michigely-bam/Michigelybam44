import { spawn, execSync } from 'child_process'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
import { stopAllJadibots } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'update',
    alias: ['gitpull', 'pullupdate'],
    category: 'owner',
    description: 'Pull del código desde GitHub, mostrar archivos modificados y reiniciar bot',
    usage: '.update',
    example: '.update',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

function getStatusPath(line = '') {
    const value = String(line || '').trim()
    if (!value) return ''
    const renameParts = value.split(' -> ')
    const raw = renameParts[renameParts.length - 1]
    return raw.replace(/^[MADRCU?! ]+\s+/, '').trim().replace(/^"|"$/g, '')
}

function filterRuntimeStatus(statusOutput = '') {
    return String(statusOutput || '')
        .split('\n')
        .filter(Boolean)
        .filter(line => !IGNORED_RUNTIME_STATUS_PATHS.has(getStatusPath(line)))
        .join('\n')
}

async function closeSocketsBeforeRestart(sock) {
    let stoppedSubbots = []

    try {
        stoppedSubbots = await stopAllJadibots()
        if (stoppedSubbots.length) {
            console.log(`[Update] Jadibots detenidos antes del reinicio: ${stoppedSubbots.join(', ')}`)
        }
    } catch (error) {
        console.error('[Update] Error deteniendo jadibots:', error?.message || error)
    }

    try {
        sock?.ev?.removeAllListeners?.('connection.update')
        sock?.ev?.removeAllListeners?.('messages.upsert')
        sock?.ws?.close?.()
        sock?.end?.()
        console.log('[Update] Socket principal cerrado antes de reiniciar')
    } catch (error) {
        console.error('[Update] Error cerrando socket principal:', error?.message || error)
    }

    await new Promise(resolve => setTimeout(resolve, stoppedSubbots.length ? 1800 : 900))
    return stoppedSubbots
}

async function handler(m, { sock }) {
    try {
        await m.react('🔄')

        let hasGit = false
        try {
            execSync('git --version', { stdio: 'pipe' })
            hasGit = true
        } catch {}

        if (!hasGit) {
            await m.react('❌')
            return m.reply(
                `❌ *Error*\n\n` +
                `> Git no está instalado en el servidor\n` +
                `> Instala git primero: \`apt install git\` / \`pkg install git\``
            )
        }

        await m.reply(
            `🔄 *ᴜᴘᴅᴀᴛᴇ sᴄʀɪᴘᴛ*\n\n` +
            `📡 Step 1/3 — Verificando estado del repositorio...`
        )

        let remoteInfo
        try {
            remoteInfo = execSync('git remote -v', { stdio: 'pipe', encoding: 'utf-8' }).trim()
        } catch {
            await m.react('❌')
            return m.reply(
                `❌ *Error*\n\n` +
                `> No se pudo leer el repositorio remoto\n` +
                `> Asegúrate de que esta carpeta es un repositorio git`
            )
        }

        let statusOutput = ''
        try {
            // Ignora archivos/directorios no rastreados generados por el hosting/runtime
            // (.cache, .npm, temp, tmp, etc.). Solo bloquea si hay cambios en archivos
            // que Git ya está siguiendo, porque esos sí podrían perderse al hacer pull.
            statusOutput = filterRuntimeStatus(
                execSync('git status --porcelain --untracked-files=no', { stdio: 'pipe', encoding: 'utf-8' }).trim()
            )
        } catch {}

        if (statusOutput) {
            const changedFiles = statusOutput.split('\n').filter(Boolean)
            const fileList = changedFiles.slice(0, 10).map(f => `> \`${f.trim()}\``).join('\n')
            const extra = changedFiles.length > 10 ? `\n> ...y ${changedFiles.length - 10} archivos más` : ''

            await m.react('⚠️')
            return m.reply(
                `⚠️ *ʜᴀʏ ᴄᴀᴍʙɪᴏs sɪɴ ᴄᴏᴍᴍɪᴛ*\n\n` +
                `> Archivos sin commit:\n` +
                `${fileList}${extra}\n\n` +
                `> ¡Haz commit o stash antes de actualizar!\n` +
                `> O usa \`git stash\` y vuelve a intentar`
            )
        }

        await m.reply(
            `✅ *Repositorio listo*\n\n` +
            `> No hay cambios locales\n\n` +
            `📥 Step 2/3 — Descargando actualizaciones...`
        )

        let pullOutput = ''
        try {
            pullOutput = execSync('git pull origin main', {
                stdio: 'pipe',
                encoding: 'utf-8',
                timeout: 120000
            }).trim()
        } catch (e) {
            const errMsg = e.stderr || e.stdout || e.message
            if (errMsg.includes('CONFLICT') || errMsg.includes('conflict')) {
                await m.react('❌')
                return m.reply(
                    `❌ *Conflict*\n\n` +
                    `> ¡Ocurrió un conflicto de merge!\n` +
                    `> Resuélvelo manualmente:\n` +
                    `> 1. Abre el servidor\n` +
                    `> 2. Ejecuta \`git status\`\n` +
                    `> 3. Resuelve el conflicto\n` +
                    `> 4. \`git add . && git commit\``
                )
            }
            await m.react('❌')
            return m.reply(
                `❌ *Error al hacer pull*\n\n` +
                `> ${errMsg.slice(0, 500)}`
            )
        }

        const alreadyUpToDate = pullOutput.includes('Already up to date') || pullOutput.includes('ya está actualizado')

        if (alreadyUpToDate) {
            await m.react('✅')
            return m.reply(
                `✅ *Ya está actualizado*\n\n` +
                `> El script ya está en la última versión\n` +
                `> No hay nada que actualizar`
            )
        }

        let filesChanged = []
        try {
            const diffStat = execSync('git diff --stat HEAD~1 HEAD', {
                stdio: 'pipe',
                encoding: 'utf-8',
                timeout: 30000
            }).trim()

            if (diffStat) {
                const lines = diffStat.split('\n')
                for (const line of lines) {
                    const match = line.match(/^\s*(.+?)\s*\|/)
                    if (match && !match[1].includes('file changed')) {
                        filesChanged.push(match[1].trim())
                    }
                }
            }
        } catch {}

        if (filesChanged.length === 0) {
            try {
                const logOutput = execSync('git log --oneline -1 --name-only', {
                    stdio: 'pipe',
                    encoding: 'utf-8',
                    timeout: 30000
                }).trim()
                const logLines = logOutput.split('\n')
                filesChanged = logLines.slice(1).filter(l => l.trim() && !l.includes('commit'))
            } catch {}
        }

        let fileMessage = ''
        if (filesChanged.length > 0) {
            const displayFiles = filesChanged.slice(0, 15)
            fileMessage = displayFiles.map(f => `> • \`${f}\``).join('\n')
            if (filesChanged.length > 15) {
                fileMessage += `\n> • ...y ${filesChanged.length - 15} archivos más`
            }
        } else {
            fileMessage = '> _No se pudieron leer los detalles de los archivos_'
        }

        await m.react('✅')

        const startTime = Date.now()

        await sock.sendMessage(m.chat, {
            text: `✅ *ᴜᴘᴅᴀᴛᴇ sᴜᴋsᴇs!*\n\n` +
                  `╭┈┈⬡「 📊 *ʀɪɴɢᴋᴀsᴀɴ* 」\n` +
                  `┃ 📄 Archivos modificados: \`${filesChanged.length}\`\n` +
                  `┃ ⏰ ${new Date().toLocaleTimeString('es-VE')}\n` +
                  `╰┈┈⬡\n\n` +
                  `📋 *Archivos modificados:*\n` +
                  `${fileMessage}\n\n` +
                  `🔄 *Salida del pull:*\n` +
                  `> ${pullOutput.split('\n').slice(0, 5).join('\n> ')}\n\n` +
                  `> El bot se reiniciará en 3 segundos...`
        }, { quoted: m })

        console.log('[Update] Pull completed, restarting bot...')
        console.log('[Update] Files changed:', filesChanged)

        setTimeout(async () => {
            const cwd = process.cwd()
            const isWindows = process.platform === 'win32'

            await closeSocketsBeforeRestart(sock)

            let command, args

            if (isWindows) {
                command = 'cmd.exe'
                args = ['/c', 'start', '/b', 'node', 'index.js']
            } else {
                command = 'node'
                args = ['index.js']
            }

            const child = spawn(command, args, {
                cwd: cwd,
                detached: true,
                stdio: 'ignore',
                shell: isWindows,
                env: {
                    ...process.env,
                    RESTARTED: 'true',
                    RESTART_TIME: startTime.toString(),
                    GRACEFUL_UPDATE_RESTART: 'true'
                }
            })

            child.unref()

            console.log('[Update] New process spawned after graceful socket close, exiting current process...')

            setTimeout(() => {
                process.exit(0)
            }, 500)

        }, 3000)

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
