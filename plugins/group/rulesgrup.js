import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import fs from "fs";
import path from "path";
const pluginConfig = {
  name: "rulesgrup",
  alias: ["grouprules", "aturangrup", "grules"],
  category: "group",
  description: "Mostrar reglas de grupo / reglas",
  usage: ".rulesgrup",
  example: ".rulesgrup",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const DEFAULT_GROUP_RULES = `📜 *REGLAS DEL GRUPO*

┃ 1️⃣ Prohibido hacer spam o inundar el chat
┃ 2️⃣ Prohibido promocionar sin permiso
┃ 3️⃣ Prohibido el contenido discriminatorio o pornográfico
┃ 4️⃣ Respeta a los demás miembros
┃ 5️⃣ Usa un lenguaje respetuoso
┃ 6️⃣ No compartas enlaces sin permiso
┃ 7️⃣ Sigue las instrucciones de los administradores
┃ 8️⃣ Prohibido el acoso y el lenguaje tóxico

_¿Quieres incumplirlas? ¡Prepárate para ser expulsado!_`;

async function handler(m, { sock, config: botConfig }) {
  const db = getDatabase();
  const groupData = db.getGroup(m.chat) || {};
  const customRules = groupData.groupRules;
  const rulesText = customRules || DEFAULT_GROUP_RULES;

  const imagePath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-rules.jpg",
  );
  let imageBuffer = fs.existsSync(imagePath)
    ? fs.readFileSync(imagePath)
    : null;

  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Ourin-AI";

  if (imageBuffer) {
    await sock.sendMedia(m.chat, imageBuffer, rulesText, m, {
      type: "image",
    });
  } else {
    await m.reply(rulesText);
  }
}

export { pluginConfig as config, handler, DEFAULT_GROUP_RULES };
