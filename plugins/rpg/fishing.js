import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { getRpgContextInfo } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "fishing",
  alias: ["rpgfish"],
  category: "rpg",
  description: "Pesca para conseguir un pescado (RPG)",
  usage: ".fishing",
  example: ".fishing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: false,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(
      `⚡ *RESISTENCIA AGOTADA*

` +
        `> Necesita ${staminaCost} stamina para la pesca.
` +
        `> Tu resistencia: ${user.rpg.stamina}`,
    );
  }

  user.rpg.stamina -= staminaCost;

  await m.reply("🎣 *PESCANDO...*");
  await new Promise((r) => setTimeout(r, 2000));

  const drops = [
    { item: "trash", chance: 20, name: "🗑️ Basura", exp: 10 },
    { item: "fish", chance: 50, name: "🐟 Pez", exp: 100 },
    { item: "prawn", chance: 30, name: "🦐 Camarón", exp: 150 },
    { item: "octopus", chance: 15, name: "🐙 Pulpo", exp: 300 },
    { item: "shark", chance: 5, name: "🦈 Tiburón", exp: 800 },
    { item: "whale", chance: 1, name: "🐳 Ballena", exp: 2000 },
  ];

  const rand = Math.random() * 100;
  let caught = drops[0];

  for (const drop of drops.sort((a, b) => a.chance - b.chance)) {
    if (rand <= drop.chance) {
      caught = drop;
      break;
    }
  }

  const qty = 1;
  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + qty;

  const expReward = caught.exp;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);

  db.save();

  let txt = `🎣 *la pesca terminada*

`;
  txt += `╭┈┈⬡「 📦 *RESULTADO* 」\n`;
  txt += `┃ ${caught.name}: *+${qty}*\n`;
  txt += `┃ 🚄 Exp: *+${expReward}*\n`;
  txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
