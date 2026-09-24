import fs from 'fs'
import path from 'path'
import { execSync, exec } from 'child_process'
const pluginConfig = {
    name: 'updatescript',
    alias: ['updatebot', 'updatesc'],
    category: 'owner',
    description: "Actualizar el script automático de GitHub con una copia de seguridad de datos importante",
    usage: '.updatescript',
    example: '.updatescript',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const REPO_URL = 'https://github.com/LuckyArch/OurinMD.git'
const BRANCH = 'main'

const PRESERVE_ITEMS = [
    'config.js',
    'db.json',
    'sessions',
    'storage',
    'database',
    '.env',
    'node_modules',
    'tmp',
    'temp'
]

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function copyRecursiveSync(src, dest, preserve, relativePath = '') {
    const stats = fs.statSync(src)

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
        const entries = fs.readdirSync(src)
        let count = 0

        for (const entry of entries) {
            const relPath = relativePath ? `${relativePath}/${entry}` : entry
            const shouldPreserve = preserve.some(p => relPath === p || relPath.startsWith(p + '/'))

            if (shouldPreserve) continue

            count += copyRecursiveSync(
                path.join(src, entry),
                path.join(dest, entry),
                preserve,
                relPath
            )
        }
        return count
    }

    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.copyFileSync(src, dest)
    return 1
}

function backupFile(baseDir, backupDir, filePath) {
    const src = path.join(baseDir, filePath)
    const dest = path.join(backupDir, filePath)

    if (!fs.existsSync(src)) return false

    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
        const entries = fs.readdirSync(src, { withFileTypes: true })
        for (const entry of entries) {
            backupFile(baseDir, backupDir, path.join(filePath, entry.name))
        }
    } else {
        const dir = path.dirname(dest)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.copyFileSync(src, dest)
    }
    return true
}

function cleanDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true })
    }
}

async function handler(m, { sock }) {
    const baseDir = process.cwd()
    const tempDir = path.join(baseDir, 'tmp', 'update_clone')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupDir = path.join(baseDir, 'backup', `pre_update_${timestamp}`)

    try {
        let hasGit = false
        try {
            execSync('git --version', { stdio: 'pipe' })
            hasGit = true
        } catch {}

        if (!hasGit) {
            return m.reply(
                `❌ *ERROR*\n\n` +
                `> Git no está instalado en el servidor
` +
                `> Instala Git primero: \`apt install git\` / \`pkg install git\``
            )
        }

        await m.react('🕕')
        await m.reply(
            `🔄 *ᴜᴘᴅᴀᴛᴇ sᴄʀɪᴘᴛ*\n\n` +
            `> Repo: \`LuckyArch/OurinMD\`\n` +
            `> Branch: \`${BRANCH}\`\n\n` +
            `📦 Paso 1/4 — Creando copia de seguridad de los datos importantes...`
        )

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        const backedUp = []
        for (const item of PRESERVE_ITEMS) {
            if (item === 'node_modules' || item === 'tmp' || item === 'temp') continue
            if (backupFile(baseDir, backupDir, item)) {
                backedUp.push(item)
            }
        }

        await m.reply(
            `✅ *ʙᴀᴄᴋᴜᴘ COMPLETADO*\n\n` +
            `> ${backedUp.length} elementos guardados\n` +
            `> ${backedUp.map(i => `\`${i}\``).join(', ')}\n\n` +
            `📥 Paso 2/4 — Clonando el repositorio más reciente...`
        )

        cleanDir(tempDir)

        try {
            execSync(`git clone --depth 1 --branch ${BRANCH} ${REPO_URL} "${tempDir}"`, {
                stdio: 'pipe',
                timeout: 120000
            })
        } catch (e) {
            await m.react('❌')
            return m.reply(
                `❌ *ERROR ᴄʟᴏɴᴇ*\n\n` +
                `> ${e.message}\n\n` +
                `💾 Copia de seguridad guardada en: \`backup/pre_update_${timestamp}\``
            )
        }

        const gitDir = path.join(tempDir, '.git')
        cleanDir(gitDir)

        await m.reply(
            `✅ *ᴄʟᴏɴᴇ COMPLETADO*\n\n` +
            `El último guión se descargó con éxito

` +
            `📋 Paso 3/4 — Copiando archivos nuevos...`
        )

        let copiedCount = 0
        try {
            copiedCount = copyRecursiveSync(tempDir, baseDir, PRESERVE_ITEMS)
        } catch (e) {
            await m.react('❌')
            return m.reply(
                `❌ *ERROR ᴄᴏᴘʏ*\n\n` +
                `> ${e.message}\n\n` +
                `💾 Copia de seguridad guardada en: \`backup/pre_update_${timestamp}\``
            )
        }

        cleanDir(tempDir)

        await m.reply(
            `✅ *ᴄᴏᴘʏ COMPLETADO*\n\n` +
            `> ${copiedCount} archivos actualizados\n` +
            `> Los datos importantes no se han perdido

` +
            `🔧 Step 4/4 — Install dependencies...`
        )

        try {
            execSync('npm install --production', {
                cwd: baseDir,
                timeout: 300000,
                stdio: 'pipe'
            })
            await m.reply(`✅ *INSTALACIÓN DE NPM COMPLETADA*`)
        } catch (e) {
            await m.reply(
                `⚠️ *FALLÓ LA INSTALACIÓN DE NPM*

` +
                `> ${e.message?.slice(0, 200)}\n` +
                `> Ejecuta \`npm install\` manualmente`
            )
        }

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text:
                `✅ ¡La actualización está terminada!

` +
                `╭┈┈⬡「 📊 *RESUMEN* 」
` +
                `┃ 📄 Archivos actualizados: \`${copiedCount}\`\n` +
                `┃ 💾 Backup: \`backup/pre_update_${timestamp}\`\n` +
                `┃ 📦 Repo: \`LuckyArch/OurinMD\`\n` +
                `╰┈┈⬡\n\n` +
                `El bot se reinicia en 3 segundos...
` +
                `> Si hay un error, restablezca el backup`
        }, { quoted: m })

        setTimeout(() => {
            process.exit(0)
        }, 3000)

    } catch (error) {
        cleanDir(tempDir)
        await m.react('❌')
        return m.reply(
            `❌ *ᴜᴘᴅᴀᴛᴇ ERROR*\n\n` +
            `> ${error.message}\n\n` +
            `💾 Copia de seguridad guardada en: \`backup/pre_update_${timestamp}\``
        )
    }
}

export { pluginConfig as config, handler }
