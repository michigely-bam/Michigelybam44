import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";
const pluginConfig = {
  name: "tolak",
  alias: ["reject", "no", "gaktau"],
  category: "fun",
  description: "Rechazar el disparo de alguien",
  usage: ".tolak @tag",
  example: ".tolak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

let thumbFun = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-games.jpg",
  );
  if (fs.existsSync(thumbPath)) thumbFun = fs.readFileSync(thumbPath);
} catch (e) {}

const rejectionQuotes = [
  "Sé paciente, ¡el mejor vendrá! 🌟",
  "Ni siquiera una coincidencia significa que no hay nadie. 💪",
  "Move on! ¡Hay muchos peces en el mar! 🐟",
  "Sé paciente, el amor verdadero vendrá 💕",
  "¡No pierdas el corazón, sigue luchando! 🔥",
  "El rechazo es el comienzo del éxito 💪",
  "¡Todavía hay muchas oportunidades ahí fuera! ✨",
  "¡Seguro que hay más para ti! 🌈",
];

function getContextInfo(title = "💔 *RECHAZAR*", body = "Rejected!") {
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

  if (thumbFun) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbFun,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: config.saluran?.link || "",
    };
  }

  return contextInfo;
}

async function handler(m, { sock }) {
  const db = getDatabase();

  let shooterJid = null;

  if (m.quoted) {
    shooterJid = m.quoted.sender;
  } else if (m.mentionedJid?.[0]) {
    shooterJid = m.mentionedJid[0];
  }

  if (!shooterJid) {
    const sessions = global.tembakSessions || {};
    const mySession = Object.entries(sessions).find(
      ([key, val]) => val.target === m.sender && val.chat === m.chat,
    );

    if (mySession) {
      shooterJid = mySession[1].shooter;
    }
  }

  if (!shooterJid) {
    return m.reply(
      `⚠️ *MODO DE USO*\n\n` +
        `> Responder el mensaje de disparos + \`${m.prefix}tolak\`\n` +
        `> O \`${m.prefix}tolak @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *falló*

> ¡No puedes resistirte!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *falló*

> ¡Bot no tiene corazón para negarse!`);
  }

  let shooterData = db.getUser(shooterJid) || {};
  let myData = db.getUser(m.sender) || {};

  if (!shooterData.fun) shooterData.fun = {};
  if (!myData.fun) myData.fun = {};

  if (
    shooterData.fun.pasangan !== m.sender &&
    shooterData.fun.tembakTarget !== m.sender
  ) {
    return m.reply(
      `❌ *NADIE SE TE ESTÁ DECLARANDO*\n\n` +
        `> @${shooterJid.split("@")[0]} no te está proponiendo ser pareja`,
      { mentions: [shooterJid] },
    );
  }

  delete shooterData.fun.pasangan;
  delete shooterData.fun.tembakTarget;
  delete myData.fun.pasangan;

  if (!shooterData.fun.ditolakCount) shooterData.fun.ditolakCount = 0;
  shooterData.fun.ditolakCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (global.tembakSessions?.[sessionKey]) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    rejectionQuotes[Math.floor(Math.random() * rejectionQuotes.length)];

  await m.react("💔");
  const ctx = getContextInfo("💔 *ᴅɪRECHAZAR*", "Move on!");
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💔 *OH, QUE EL PACIENTE YA* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} rechazó a @${shooterJid.split("@")[0]} como su pareja

` +
      `¡Tenga paciencia, hay más! 😢`,
    { mentions: [m.sender, shooterJid] },
  );
}

export { pluginConfig as config, handler };
