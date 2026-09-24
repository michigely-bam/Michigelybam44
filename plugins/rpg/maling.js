import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { getRpgContextInfo } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "maling",
  alias: ["copet", "pickpocket"],
  category: "rpg",
  description: "Robar carteras a personas (más arriesgado que cometer un delito))",
  usage: ".maling",
  example: ".maling",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 40) {
    return m.reply(
      `❌ *SALUD DEMASIADO BAJA*\n\n` +
        `> ¡Necesitas al menos 40 HP para robar!
` +
        `> Tu salud: ${user.rpg.health} HP`,
    );
  }

  await sock.sendMessage(
    m.chat,
    {
      text: "🦹 *ROBANDO CARTERAS...*",
      contextInfo: getRpgContextInfo("🦹 MALING", "Picking!"),
    },
    { quoted: m },
  );
  await new Promise((r) => setTimeout(r, 2500));

  const outcomes = [
    {
      success: true,
      type: "big",
      money: 20000,
      exp: 500,
      msg: "¡Lo hice!",
    },
    {
      success: true,
      type: "medium",
      money: 8000,
      exp: 200,
      msg: "Tengo una billetera delgada...",
    },
    {
      success: true,
      type: "small",
      money: 2000,
      exp: 50,
      msg: "Sólo tengo un cambio.",
    },
    {
      success: false,
      type: "caught",
      fine: 15000,
      health: 30,
      msg: "¡Atrapado y golpeado por una multitud!",
    },
    {
      success: false,
      type: "police",
      fine: 25000,
      health: 10,
      msg: "¡La policía te atrapó!",
    },
    {
      success: false,
      type: "fail",
      fine: 0,
      health: 0,
      msg: "El objetivo escapó, completamente falló.",
    },
  ];

  const weights = [5, 20, 30, 15, 10, 20];
  const rand = Math.random() * 100;
  let cumulative = 0;
  let outcome = outcomes[5];

  for (let i = 0; i < outcomes.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      outcome = outcomes[i];
      break;
    }
  }

  let txt = "";

  if (outcome.success) {
    user.koin = (user.koin || 0) + outcome.money;
    await addExpWithLevelCheck(sock, m, db, user, outcome.exp);

    txt = `✅ *ROBAR COMPLETADO*\n\n`;
    txt += `> ${outcome.msg}\n`;
    txt += `> 💰 Puede: *+Rp ${outcome.money.toLocaleString("id-ID")}*\n`;
    txt += `> 🚄 Exp: *+${outcome.exp}*`;
  } else {
    const actualFine = Math.min(outcome.fine, user.koin || 0);
    user.koin = Math.max(0, (user.koin || 0) - actualFine);
    user.rpg.health = Math.max(0, user.rpg.health - outcome.health);

    txt = `❌ *ROBAR ERROR*\n\n`;
    txt += `> ${outcome.msg}\n`;
    if (outcome.fine > 0)
      txt += `> 💸 Multa: *-Rp ${actualFine.toLocaleString("id-ID")}*\n`;
    if (outcome.health > 0) txt += `> ❤️ Health: *-${outcome.health}*`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      txt += `

💀 Tú estás muerto.
> ¡La EXP se redujo un 50 %!`;
    }
  }

  db.save();
  await sock.sendMessage(
    m.chat,
    { text: txt, contextInfo: getRpgContextInfo("🦹 MALING", "Result!") },
    { quoted: m },
  );
}

export { pluginConfig as config, handler };
