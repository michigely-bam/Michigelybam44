import { getDatabase } from "../../src/lib/ourin-database.js";
import { getRpgContextInfo } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "weekly",
  alias: ["mingguan"],
  category: "rpg",
  description: "Reclamo de recompensas semanales (más grandes que diarias)",
  usage: ".weekly",
  example: ".weekly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.cooldowns) user.cooldowns = {};
  const lastWeekly = user.cooldowns.weekly || 0;
  const now = Date.now();

  if (now - lastWeekly < WEEKLY_COOLDOWN) {
    const remaining = lastWeekly + WEEKLY_COOLDOWN - now;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    return m.reply(
      `🕕 *ᴡᴇᴇᴋʟʏ ᴄᴏᴏʟᴅᴏᴡɴ*

> Has estado reclamando esta semana.
> Espera: *${days} días y ${hours} horas más*.`,
    );
  }

  const expReward = Math.floor(Math.random() * 20000) + 10000;
  const moneyReward = Math.floor(Math.random() * 50000) + 30000;
  const crateReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);
  user.koin = (user.koin || 0) + moneyReward;

  if (!user.inventory) user.inventory = {};
  user.inventory.uncommon = (user.inventory.uncommon || 0) + crateReward;

  user.cooldowns.weekly = now;
  db.save();

  let txt = `🎊 *RECOMPENSA SEMANAL RECLAMADA*\n\n`;
  txt += `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n`;
  txt += `┃ 🚄 Exp: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `┃ 🪙 Dinero: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `┃ 🛍️ Caja poco común: *+${crateReward}*\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> ¡Reclamen otra vez la semana que viene!`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
