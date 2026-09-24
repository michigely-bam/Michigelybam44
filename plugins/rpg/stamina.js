import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";
const pluginConfig = {
  name: "stamina",
  alias: ["energy", "cekstamina"],
  category: "rpg",
  description: "Verificación y restauración de la resistencia",
  usage: ".stamina / .stamina contenido",
  example: ".stamina",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
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

function getContextInfo(title = "⚡ *RESISTENCIA*", body = "Energía") {
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

function createStaminaBar(current, max) {
  const filled = Math.round((current / max) * 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];

  if (!user.rpg) user.rpg = {};
  user.rpg.stamina = user.rpg.stamina ?? 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const subCmd = args[0]?.toLowerCase();

  if (subCmd === "isi" || subCmd === "restore" || subCmd === "heal") {
    const potionCost = 5000;

    if (user.rpg.stamina >= user.rpg.maxStamina) {
      return m.reply(`⚡ *sᴛᴀᴍɪɴᴀ LLENO*

> ¡Tu resistencia está llena!`);
    }

    if ((user.koin || 0) < potionCost) {
      return m.reply(
        `❌ *saldo no es suficiente*

` +
          `> Costo: Rp. ${potionCost.toLocaleString("id-ID")}\n` +
          `> Saldo: Rp ${(user.koin || 0).toLocaleString("id-ID")}`,
      );
    }

    user.koin -= potionCost;
    const restored = user.rpg.maxStamina - user.rpg.stamina;
    user.rpg.stamina = user.rpg.maxStamina;

    db.save();

    await m.react("⚡");
    return sock.sendMessage(
      m.chat,
      {
        text:
          `⚡ *sᴛᴀᴍɪɴᴀ ᴅɪɪsɪ*\n\n` +
          `╭┈┈⬡「 💊 *ʀᴇsᴛᴏʀᴇ* 」\n` +
          `┃ ⚡ Stamina: *+${restored}*\n` +
          `┃ 💵 El costo: *-Rp ${potionCost.toLocaleString("id-ID")}*\n` +
          `┃ 📊 Ahora: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        contextInfo: getContextInfo(),
      },
      { quoted: m },
    );
  }

  const staminaBar = createStaminaBar(user.rpg.stamina, user.rpg.maxStamina);

  let txt = `⚡ *sᴛᴀᴍɪɴᴀ sᴛᴀᴛᴜs*\n\n`;
  txt += `╭┈┈⬡「 📊 *ɪɴꜰᴏ* 」\n`;
  txt += `┃ ⚡ Stamina: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n`;
  txt += `┃ 📊 [${staminaBar}]\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `El contenido de la resistencia: \`${m.prefix}stamina contenido (Rp 5.000)
`;
  txt += `> Resistencia recuperada automática cada hora`;

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
