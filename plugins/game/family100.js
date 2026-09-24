import { getRandomItem, createSession, getSession, endSession, hasActiveSession, setSessionTimer, getRemainingTime, formatRemainingTime, isSurrender, isReplyToGame, GAME_REWARD, getRandomReward, getProgressiveHint } from '../../src/lib/ourin-game-data.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getGameContextInfo } from '../../src/lib/ourin-context.js'
const pluginConfig = {
    name: 'family100',
    alias: ['f100', 'survei'],
    category: 'game',
    description: "La encuesta dice, ¿adivina la respuesta principal a la encuesta?",
    usage: '.family100',
    example: '.family100',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const chatId = m.chat;
    
    if (hasActiveSession(chatId)) {
        const session = getSession(chatId);
        if (session && session.gameType === 'family100') {
            const remaining = getRemainingTime(chatId);
            const answered = session.answered || [];
            const total = session.question.jawaban.length;
            
            let text = `⚠️ *¡Ya hay una partida en curso!*

`;
            text += `📋 *${session.question.soal}*\n\n`;
            text += `La respuesta es adivinar (${answered.length}/${total})\n`;
            answered.forEach((ans, i) => {
                text += `${i + 1}. ✅ ${ans}\n`;
            });
            for (let i = answered.length; i < total; i++) {
                text += `${i + 1}. ❓ ???\n`;
            }
            text += `
⏱️ Restante: *${formatRemainingTime(remaining)}*`;
            await m.reply(text);
            return;
        }
    }
    
    const question = getRandomItem('family100.json');
    if (!question) {
        await m.reply("❌ ¡Los juegos de datos no están disponibles!");
        return;
    }
    
    const total = question.jawaban.length;
    
    let text = `📊 *FAMILY 100*\n\n`;
    text += `📋 *${question.soal}*\n\n`;
    text += `Respuesta 0/${total})\n`;
    for (let i = 0; i < total; i++) {
        text += `${i + 1}. ❓ ???\n`;
    }
    text += `
⏱️ El tiempo: *120 segundos*
`;
    text += `🎁 Un regalo por respuesta: *EXP + Coina (random)*

`;
    text += `_Escribe tu respuesta directamente o contesta "renunciar"_`;
    
    const sentMsg = await sock.sendMessage(chatId, { text, contextInfo: getGameContextInfo('📊 FAMILY 100', 'Survey says!') }, { quoted: m });
    
    const session = createSession(chatId, 'family100', question, sentMsg.key, 120000);
    session.answered = [];
    session.answeredBy = {};
    
    setSessionTimer(chatId, async () => {
        const sess = getSession(chatId);
        const answered = sess?.answered || [];
        const remaining = question.jawaban.filter(j => !answered.includes(j.toLowerCase()));
        
        let timeoutText = `⏱️ *Bueno, es tarde, ¡se acabó el tiempo!*

`;
        timeoutText += `Adivinadas: *${answered.length}/${question.jawaban.length}*\n\n`;
        if (remaining.length > 0) {
            timeoutText += `respuestas restantes:
`;
            remaining.forEach(ans => {
                timeoutText += `• ${ans}\n`;
            });
        }
        
        endSession(chatId);
        await sock.sendMessage(chatId, { text: timeoutText, contextInfo: getGameContextInfo() });
    });
}

async function answerHandler(m, sock) {
    const chatId = m.chat;
    const session = getSession(chatId);
    
    if (!session || session.gameType !== 'family100') return false;
    
    const userAnswer = (m.body || '').toLowerCase().trim();
    if (!userAnswer || userAnswer.startsWith('.')) return false;
    
    if (isSurrender(userAnswer)) {
        const answered = session.answered || [];
        const remaining = session.question.jawaban.filter(j => !answered.includes(j.toLowerCase()));
        
        let text = `🏳️ *Bueno, me rindo...*

`;
        text += `Adivinadas: *${answered.length}/${session.question.jawaban.length}*\n\n`;
        if (remaining.length > 0) {
            text += `respuestas restantes:
`;
            remaining.forEach(ans => {
                text += `• ${ans}\n`;
            });
        }
        
        endSession(chatId);
        await m.reply(text);
        return true;
    }
    
    const correctAnswers = session.question.jawaban.map(j => j.toLowerCase());
    const answered = session.answered || [];
    
    if (answered.includes(userAnswer)) {
        await m.reply(`⚠️ Respuesta "${userAnswer}" ¡Es predecible!`);
        return true;
    }
    
    const matchIndex = correctAnswers.findIndex(ans => {
        const similarity = getSimilarity(ans, userAnswer);
        return similarity >= 0.8 || ans.includes(userAnswer) || userAnswer.includes(ans);
    });
    
    if (matchIndex !== -1) {
        const originalAnswer = session.question.jawaban[matchIndex];
        
        if (!answered.includes(originalAnswer.toLowerCase())) {
            session.answered.push(originalAnswer.toLowerCase());
            session.answeredBy[originalAnswer.toLowerCase()] = m.sender;
            
            const db = getDatabase();
            const user = db.getUser(m.sender);
            
            const answerReward = getRandomReward();
            if (!user.rpg) user.rpg = {};
            await addExpWithLevelCheck(sock, m, db, user, answerReward.exp);
            db.updateKoin(m.sender, answerReward.koin);
            db.save();
            
            if (session.answered.length === correctAnswers.length) {
                endSession(chatId);
                
                const participants = Object.values(session.answeredBy);
                const uniqueParticipants = [...new Set(participants)];
                
                let text = `🎉 *¡Todo perdido, hombre!*

`;
                text += `> 📋 *${session.question.soal}*\n\n`;
                session.question.jawaban.forEach((ans, i) => {
                    const who = session.answeredBy[ans.toLowerCase()];
                    text += `${i + 1}. ✅ ${ans} - @${who?.split('@')[0] || '?'}\n`;
                });
                text += `
🎊 ¡Felicidades! Ganaron ${uniqueParticipants.length} participantes.`;
                
                await m.reply(text, { mentions: uniqueParticipants });
                return true;
            }
            
            const total = session.question.jawaban.length;
            let text = `✅ @${m.sender.split('@')[0]} (+${answerReward.exp} EXP, +${answerReward.koin} Monedas)

`;
            text += `📋 *${session.question.soal}*\n\n`;
            session.question.jawaban.forEach((ans, i) => {
                const isAnswered = session.answered.includes(ans.toLowerCase());
                if (isAnswered) {
                    text += `${i + 1}. ✅ ${ans}\n`;
                } else {
                    text += `${i + 1}. ❓ ???\n`;
                }
            });
            text += `
Restante ${total - session.answered.length} ¡Responde otra vez!`;
            
            await m.reply(text, { mentions: [m.sender] });
            return true;
        }
    }
    
    await m.reply(`❌ Incorrecto, inténtalo de nuevo.`);
    return true;
}

function getSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= shorter.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[shorter.length] = lastValue;
    }
    
    return (longer.length - costs[shorter.length]) / longer.length;
}

export { pluginConfig as config, handler, answerHandler }
