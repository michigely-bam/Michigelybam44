import { getDatabase } from "../../src/lib/ourin-database.js";
import { getRpgContextInfo } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "quest",
  alias: ["misi", "mission"],
  category: "rpg",
  description: "Tome la búsqueda diaria de la recompensa de bonos",
  usage: ".quest",
  example: ".quest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const QUESTS = [
  {
    id: "mining5",
    name: "Minero principiante",
    desc: "Mining 5 kali",
    target: 5,
    reward: { money: 10000, exp: 1000 },
  },
  {
    id: "fishing5",
    name: "Pescador experto",
    desc: "Fishing 5 kali",
    target: 5,
    reward: { money: 8000, exp: 800 },
  },
  {
    id: "adventure3",
    name: "Aventurero auténtico",
    desc: "Adventure 3 kali",
    target: 3,
    reward: { money: 15000, exp: 1500 },
  },
  {
    id: "work10",
    name: "Trabajador incansable",
    desc: "Work 10 kali",
    target: 10,
    reward: { money: 20000, exp: 2000 },
  },
  {
    id: "hunt5",
    name: "Cazador experto",
    desc: "Hunt 5 kali",
    target: 5,
    reward: { money: 12000, exp: 1200 },
  },
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.quest) user.quest = {};

  const args = m.args || [];
  const sub = args[0]?.toLowerCase();

  if (sub === "claim") {
    const questId = args[1];
    if (!questId || !user.quest[questId]) {
      return m.reply(
        `❌ *ǫᴜᴇsᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ*

> Quest no encontrado o aún tomado!`,
      );
    }

    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`❌ *ɪɴᴠᴀʟɪᴅ ǫᴜᴇsᴛ*

> ¡ ID de búsqueda inválida!`);
    }

    if (user.quest[questId].progress < quest.target) {
      return m.reply(
        `❌ *quest no ha terminado*

` +
          `> Progress: ${user.quest[questId].progress}/${quest.target}`,
      );
    }

    if (user.quest[questId].claimed) {
      return m.reply(`❌ *ha sido reclamado*

> ¡Esta búsqueda ha sido reclamada!`);
    }

    user.koin = (user.koin || 0) + quest.reward.money;
    db.updateExp(m.sender, quest.reward.exp);
    user.quest[questId].claimed = true;

    db.save();
    return m.reply(
      `✅ *ǫᴜᴇsᴛ ᴄʟᴀɪᴍᴇᴅ*\n\n> 🎯 ${quest.name}\n> 💰 Money: +Rp ${quest.reward.money.toLocaleString("id-ID")}\n> 🚄 Exp: +${quest.reward.exp}`,
    );
  }

  if (sub === "take") {
    const questId = args[1];
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`❌ *ǫᴜᴇsᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ*

> Ver lista: \`.quest\``);
    }

    if (user.quest[questId]) {
      return m.reply(`❌ *se ha tomado*

> ¡Esta búsqueda ha sido tomada!`);
    }

    user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() };
    db.save();
    return m.reply(
      `✅ *ǫᴜᴇsᴛ ᴅɪᴀᴍʙɪʟ*\n\n> 🎯 ${quest.name}\n> 📝 ${quest.desc}\n> 🎁 Reward: Rp ${quest.reward.money.toLocaleString("id-ID")} + ${quest.reward.exp} Exp`,
    );
  }

  let txt = `📜 *ǫᴜᴇsᴛ ʟɪsᴛ*\n\n`;

  for (const quest of QUESTS) {
    const userQuest = user.quest[quest.id];
    let status = "⬜ No se ha tomado";
    if (userQuest) {
      if (userQuest.claimed) {
        status = "✅ Terminado";
      } else if (userQuest.progress >= quest.target) {
        status = "🎁 Se puede reclamar";
      } else {
        status = `🔄 ${userQuest.progress}/${quest.target}`;
      }
    }

    txt += `╭┈┈⬡「 🎯 *${quest.name}* 」\n`;
    txt += `┃ 📝 ${quest.desc}\n`;
    txt += `┃ 🎁 Rp ${quest.reward.money.toLocaleString("id-ID")} + ${quest.reward.exp} Exp\n`;
    txt += `┃ 📊 Status: ${status}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  }

  txt += `> Aceptar: \`.quest take <id>\`\n`;
  txt += `> Claim: \`.quest claim <id>\``;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
