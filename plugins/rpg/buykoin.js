import { getDatabase } from "../../src/lib/ourin-database.js";
import { getRpgContextInfo } from "../../src/lib/ourin-context.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";
const pluginConfig = {
  name: "buykoin",
  alias: ["belikoin", "belicoin", "exptokoin", "exptocoin"],
  category: "rpg",
  description: "Cambiar EXP por monedas",
  usage: ".buykoin <cantidad>",
  example: ".buykoin 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EXP_PER_KOIN = 2;

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

function getContextInfo(title = "💱 *ʙᴜʏ MONEDAS*", body = "Cambiar EXP") {
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

  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const amountStr = args[0];

  if (!amountStr) {
    let txt = `💱 *ʙᴜʏ MONEDAS*\n\n`;
    txt += `> ¡Cambia EXP por monedas!

`;
    txt += `╭┈┈⬡「 📊 *TIPO DE CAMBIO* 」
`;
    txt += `┃ 💎 ${EXP_PER_KOIN} EXP = 1 moneda
`;
    txt += `╰┈┈⬡\n\n`;
    txt += `╭┈┈⬡「 📋 *sᴀʟᴅᴏᴍᴜ* 」\n`;
    txt += `┃ 🚄 EXP: *${(user.exp || 0).toLocaleString("id-ID")}*\n`;
    txt += `┃ 💰 Monedas: * ${(user.koin || 0).toLocaleString("id-ID")}*\n`;
    txt += `╰┈┈⬡\n\n`;
    txt += `> Ejemplo: \`.buykoin 10000\`\n`;
    txt += `> Uso de la voluntad ${10000 * EXP_PER_KOIN} EXP para 10.000 monedas`;

    return m.reply(txt);
  }

  let koinAmount = 0;
  if (amountStr === "all" || amountStr === "max") {
    koinAmount = Math.floor((user.exp || 0) / EXP_PER_KOIN);
  } else {
    koinAmount = parseInt(amountStr);
  }

  if (!koinAmount || koinAmount <= 0) {
    return m.reply(`❌ ¡Introdúzca un conteo válido de monedas!`);
  }

  const expNeeded = koinAmount * EXP_PER_KOIN;

  if ((user.exp || 0) < expNeeded) {
    const maxPossible = Math.floor((user.exp || 0) / EXP_PER_KOIN);
    return m.reply(
      `❌ *¡EXP insuficiente!*

` +
        `> Necesario: *${expNeeded.toLocaleString("id-ID")} EXP*\n` +
        `> Tu EXP: *${(user.exp || 0).toLocaleString("id-ID")} EXP*\n\n` +
        `> Máximo: *${maxPossible.toLocaleString("id-ID")} Monedas*`,
    );
  }

  // Use manual user update instead of updateKoin/updateExp to do batch update
  // But since logic was db.setUser, let's stick to update logic here
  const newExp = (user.exp || 0) - expNeeded;
  const newKoin = (user.koin || 0) + koinAmount;

  db.setUser(m.sender, {
    exp: newExp,
    koin: newKoin,
  });

  await m.react("💱");

  let txt = `💱 ¡El intercambio fue exitoso!

`;
  txt += `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n`;
  txt += `┃ 🚄 EXP: *-${expNeeded.toLocaleString("id-ID")}*\n`;
  txt += `┃ 💰 Monedas: *+${koinAmount.toLocaleString("id-ID")}*\n`;
  txt += `╰┈┈⬡\n\n`;
  txt += `╭┈┈⬡「 📊 *saldo actual* 」
`;
  txt += `┃ 🚄 EXP: *${newExp.toLocaleString("id-ID")}*\n`;
  txt += `┃ 💰 Monedas: *${newKoin.toLocaleString("id-ID")}*\n`;
  txt += `╰┈┈⬡`;

  await sock.sendMessage(
    m.chat,
    {
      text: txt,
      contextInfo: getContextInfo(),
    },
    { quoted: m },
  );
}

export { pluginConfig as config, handler };
