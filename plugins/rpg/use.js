import { getDatabase } from "../../src/lib/ourin-database.js";
import { getRpgContextInfo } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "use",
  alias: ["pake", "makan", "open"],
  category: "rpg",
  description: "Use artículos de consumo o grúas abiertas",
  usage: ".use <item>",
  example: ".use potion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);
  const args = m.args || [];
  const itemKey = args[0]?.toLowerCase();

  if (!itemKey) {
    return m.reply(
      `🎒 *ᴜsᴇ ɪᴛᴇᴍ*\n\n` +
        `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
        `┃ > \`.use <nombre_artículo>\`\n` +
        `┃ > Consulta el inventario: \`.inventory\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
    );
  }

  user.inventory = user.inventory || {};
  user.rpg = user.rpg || {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = user.rpg.maxMana || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const count = user.inventory[itemKey] || 0;

  if (count <= 0) {
    return m.reply(
      `❌ *OBJETO NO DISPONIBLE*\n\n` +
        `> No tienes el objeto *${itemKey}*.\n` +
        `> Consulta el inventario: \`.inventory\``,
    );
  }

  let msg = "";

  switch (itemKey) {
    case "potion":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤️ *ʜᴇᴀʟᴛʜ LLENO*

¡> Tu vida está llena!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 50, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🥤 *OBJETO UTILIZADO*

¿Estás tomando una poción de salud?
❤️ Salud ahora: ${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "mpotion":
      if (user.rpg.mana >= user.rpg.maxMana) {
        return m.reply(`💧 *MANÁ LLENO*

¡> Tu maná está lleno!`);
      }
      user.rpg.mana = Math.min(user.rpg.mana + 50, user.rpg.maxMana);
      user.inventory[itemKey]--;
      msg = `🧪 *OBJETO USADO*

> Bebiste una *poción de maná*.
> 💧 Maná actual: ${user.rpg.mana}/${user.rpg.maxMana}`;
      break;

    case "stamina":
      if (user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`⚡ *sᴛᴀᴍɪɴᴀ LLENO*

¡> Tu resistencia está llena!`);
      }
      user.rpg.stamina = Math.min(user.rpg.stamina + 20, user.rpg.maxStamina);
      user.inventory[itemKey]--;
      msg = `⚡ *OBJETO UTILIZADO*

Usted toma la Poción de Stamina.
⚡ La resistencia ahora: ${user.rpg.stamina}/${user.rpg.maxStamina}`;
      break;

    case "common":
    case "uncommon":
    case "mythic":
    case "legendary":
      user.inventory[itemKey]--;
      const rewardMoney =
        Math.floor(Math.random() * (itemKey === "legendary" ? 100000 : 10000)) +
        1000;
      const rewardExp =
        Math.floor(Math.random() * (itemKey === "legendary" ? 5000 : 500)) +
        100;

      user.koin = (user.koin || 0) + rewardMoney;
      db.updateExp(m.sender, rewardExp);

      msg =
        `🎁 *ᴄʀᴀᴛᴇ ᴅɪʙᴜᴋᴀ*\n\n` +
        `Usted abre *${itemKey} Crate*!\n` +
        `> 💰 Money: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` +
        `> 🚄 Exp: +${rewardExp}`;
      break;

    default:
      return m.reply(
        `❌ *items no pueden ser usados*

> Item *${itemKey}* no se puede usar directamente.`,
      );
  }

  db.save();
  await m.reply(msg);
}

export { pluginConfig as config, handler };
