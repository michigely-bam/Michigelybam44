import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";
const pluginConfig = {
  name: "casino",
  alias: ["judi", "gamble"],
  category: "rpg",
  description: "Jugar casino para jugar al juego",
  usage: ".casino <cantidad>",
  example: ".casino 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

let thumbRpg = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-rpg.jpg",
  );
  if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath);
} catch (e) {}

function getContextInfo(title = "🎰 *ᴄᴀsɪɴᴏ*", body = "Gambling") {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const contextInfo = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (thumbRpg) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbRpg,
      mediaType: 1,
      renderLargerThumbnail: false,
      sourceUrl: config.saluran?.link || "",
    };
  }

  return contextInfo;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  let bet = args[0];

  if (!bet) {
    return m.reply(
      `⚠️ *MODO DE USO*\n\n` +
        `> \`${m.prefix}casino <cantidad>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}casino 10000\`\n` +
        `> \`${m.prefix}casino all\``,
    );
  }

  if (/^all$/i.test(bet)) {
    bet = user.koin || 0;
  } else {
    bet = parseInt(bet);
  }

  if (isNaN(bet) || bet < 1000) {
    return m.reply(`❌ *APUESTA MÍNIMA*

> Apuesta mínima: Rp 1.000`);
  }

  if (bet > (user.koin || 0)) {
    return m.reply(
      `❌ *saldo no es suficiente*

` +
        `> Su saldo: Rp ${(user.koin || 0).toLocaleString("id-ID")}\n` +
        `> Apuesta: Rp ${bet.toLocaleString("id-ID")}`,
    );
  }

  await m.react("🎰");
  await m.reply(`🎰 *GIRANDO LA RULETA...*`);
  await new Promise((r) => setTimeout(r, 2000));

  const playerScore = Math.floor(Math.random() * 100);
  const botScore = Math.floor(Math.random() * 100);

  let result, emoji, moneyChange;

  if (playerScore > botScore) {
    result = "GANASTE";
    emoji = "🎉";
    moneyChange = bet;
    user.koin = (user.koin || 0) + bet;
  } else if (playerScore < botScore) {
    result = "PERDISTE";
    emoji = "💔";
    moneyChange = -bet;
    user.koin = (user.koin || 0) - bet;
  } else {
    result = "EMPATE";
    emoji = "🤝";
    moneyChange = 0;
  }

  db.save();

  await m.react(emoji);

  let txt = `🎰 *ᴄᴀsɪɴᴏ ʀᴇsᴜʟᴛ*\n\n`;
  txt += `╭┈┈⬡「 🎲 *PUNTUACIÓN* 」
`;
  txt += `┃ 👤 Tú: *${playerScore}* puntos
`;
  txt += `┃ 🤖 Bot: *${botScore}* puntos
`;
  txt += `┃ ─────────\n`;
  txt += `┃ ${emoji} Resultado: *${result}*\n`;
  if (moneyChange !== 0) {
    txt += `┃ 💵 ${moneyChange > 0 ? "+" : ""}Rp ${moneyChange.toLocaleString("id-ID")}\n`;
  }
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> Saldo: Rp ${(user.koin || 0).toLocaleString("id-ID")}`;

  await sock.sendMessage(
    m.chat,
    {
      text: txt,
      contextInfo: getContextInfo(
        `🎰 *${result}*`,
        `${moneyChange > 0 ? "+" : ""}Rp ${moneyChange.toLocaleString("id-ID")}`,
      ),
    },
    { quoted: m },
  );
}

export { pluginConfig as config, handler };
