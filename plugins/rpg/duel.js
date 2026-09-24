import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'duel',
    alias: ['pvp', 'fight'],
    category: 'rpg',
    description: "PvP duel con otro jugador",
    usage: '.duel @user <bet>',
    example: '.duel @user 5000',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 120,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    const bet = parseInt(args[1]) || 1000
    
    if (!target) {
        return m.reply(
            `⚔️ *ᴅᴜᴇʟ ᴘᴠᴘ*\n\n` +
            `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
            `┃ > ¡Menciona al rival del duelo!
` +
            `┃ > \`.duel @user 5000\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*

> ¡No puedes dársela!`)
    }
    
    if (bet < 1000) {
        return m.reply(`❌ *ɪɴᴠᴀʟɪᴅ ʙᴇᴛ*\n\n> Minimal bet Rp 1.000!`)
    }
    
    const player1 = db.getUser(m.sender)
    const player2 = db.getUser(target) || db.setUser(target)
    
    if ((player1.koin || 0) < bet) {
        return m.reply(
            `❌ *saldo no es suficiente*

` +
            `> Tus monedas: Rp ${(player1.koin || 0).toLocaleString('id-ID')}\n` +
            `> Necesidad: Rp ${bet.toLocaleString('id-ID')}`
        )
    }
    
    if ((player2.koin || 0) < bet) {
        return m.reply(
            `❌ *RIVAL NO VÁLIDO*\n\n` +
            `¡> El equilibrio oponente no es suficiente para apostar!`
        )
    }
    
    if (!player1.rpg) player1.rpg = {}
    if (!player2.rpg) player2.rpg = {}
    
    player1.rpg.health = player1.rpg.health || 100
    player2.rpg.health = player2.rpg.health || 100
    
    if (player1.rpg.health < 30) {
        return m.reply(
            `❌ *SALUD DEMASIADO BAJA*\n\n` +
            `> ¡Necesitas al menos 30 HP para batirte en duelo!
` +
            `> Tu salud: ${player1.rpg.health} HP`
        )
    }
    
    await sock.sendMessage(m.chat, { text: `⚔️ *ᴅᴜᴇʟ INICIADO*\n\n> @${m.sender.split('@')[0]} vs @${target.split('@')[0]}\n> 💰 Bet: Rp ${bet.toLocaleString('id-ID')}`, contextInfo: getRpgContextInfo('⚔️ DUEL', 'Fight!') }, { quoted: m })
    
    await new Promise(r => setTimeout(r, 2000))
    
    const p1Power = (player1.rpg.level || 1) * 10 + Math.random() * 50
    const p2Power = (player2.rpg.level || 1) * 10 + Math.random() * 50
    
    const winner = p1Power > p2Power ? m.sender : target
    const loser = winner === m.sender ? target : m.sender
    const winnerData = winner === m.sender ? player1 : player2
    const loserData = winner === m.sender ? player2 : player1
    
    winnerData.koin = (winnerData.koin || 0) + bet
    loserData.koin = (loserData.koin || 0) - bet
    loserData.rpg.health = Math.max(0, (loserData.rpg.health || 100) - 20)
    
    const expGain = 500
    await addExpWithLevelCheck(sock, { ...m, sender: winner }, db, winnerData, expGain)
    
    db.save()
    
    let txt = `⚔️ *RESULTADO ᴅᴜᴇʟ*\n\n`
    txt += `🏆 Ganador: @${winner.split('@')[0]}\n`
    txt += `💀 Perdedor: @${loser.split('@')[0]}\n\n`
    txt += `💰 Premio: Rp. ${bet.toLocaleString('id-ID')}\n`
    txt += `> 🚄 Exp: +${expGain} (winner)`
    
    await sock.sendMessage(m.chat, { text: txt, contextInfo: getRpgContextInfo('⚔️ DUEL', 'Result!') }, { quoted: m })
}

export { pluginConfig as config, handler }
