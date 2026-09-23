import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  addJadibotOwner,
  removeJadibotOwner,
  getJadibotOwners,
} from "../../src/lib/ourin-jadibot-database.js";
import fs from "fs";
import path from "path";
import {
  isLid,
  lidToJid,
  resolveAnyLidToJid,
  isLidConverted,
} from "../../src/lib/ourin-lid.js";
import { getGroupMode } from "../group/botmode.js";

const pluginConfig = {
  name: "darpene",
  alias: ["addown", "setowner", "quitarvirgi", "dedown", "ownerlist", "listowner"],
  category: "owner",
  description: "Gestiona los propietarios del bot (según el modo)",
  usage: ".addowner <número/@etiqueta/respuesta>",
  example: ".addowner 6281234567890",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function cleanJid(jid) {
  if (!jid) return null;
  if (isLid(jid)) jid = lidToJid(jid);
  return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
}

function extractNumber(m) {
  let targetNumber = "";

  if (m.quoted) {
    let sender = m.quoted.sender || "";
    if (isLid(sender) || isLidConverted(sender)) {
      sender = resolveAnyLidToJid(sender, m.groupMembers || []);
    }
    targetNumber = sender?.replace(/[^0-9]/g, "") || "";
  } else if (m.mentionedJid?.length) {
    let jid = cleanJid(m.mentionedJid[0]);
    if (isLid(jid) || isLidConverted(jid)) {
      jid = resolveAnyLidToJid(jid, m.groupMembers || []);
    }
    targetNumber = jid?.replace(/[^0-9]/g, "") || "";
  } else if (m.args[0]) {
    targetNumber = m.args[0].replace(/[^0-9]/g, "");
    if (targetNumber.startsWith("08")) {
      targetNumber = "62" + targetNumber.slice(1);
    }
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length > 15) {
    return "";
  }

  return targetNumber;
}

function savePanelConfig() {
  try {
    const configPath = path.join(process.cwd(), "config.js");
    let content = fs.readFileSync(configPath, "utf8");

    const ownerPanelsStr = JSON.stringify(config.pterodactyl.ownerPanels || []);
    content = content.replace(
      /ownerPanels:\s*\[.*?\]/s,
      `ownerPanels: ${ownerPanelsStr}`,
    );

    const sellersStr = JSON.stringify(config.pterodactyl.sellers || []);
    content = content.replace(/sellers:\s*\[.*?\]/s, `sellers: ${sellersStr}`);

    fs.writeFileSync(configPath, content, "utf8");
    return true;
  } catch (e) {
    console.error("[AddOwner] Failed to save panel config:", e.message);
    return false;
  }
}

function removeFromSellers(targetNumber) {
  if (!config.pterodactyl.sellers) return false;
  const idx = config.pterodactyl.sellers.findIndex(
    (s) => String(s).trim() === String(targetNumber).trim(),
  );
  if (idx !== -1) {
    config.pterodactyl.sellers.splice(idx, 1);
    return true;
  }
  return false;
}

function removeFromOwnerPanels(targetNumber) {
  if (!config.pterodactyl.ownerPanels) return false;
  const idx = config.pterodactyl.ownerPanels.findIndex(
    (s) => String(s).trim() === String(targetNumber).trim(),
  );
  if (idx !== -1) {
    config.pterodactyl.ownerPanels.splice(idx, 1);
    return true;
  }
  return false;
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();
  const groupMode = m.isGroup ? getGroupMode(m.chat, db) : "private";
  const isCpanelMode = m.isGroup && groupMode === "cpanel";

  const isAdd = ["darpene", "addown", "setowner"].includes(cmd);
  const isDel = ["quitarvirgi", "dedown"].includes(cmd);
  const isList = ["ownerlist", "listowner"].includes(cmd);

  if (!config.pterodactyl) config.pterodactyl = {};
  if (!config.pterodactyl.ownerPanels) config.pterodactyl.ownerPanels = [];
  if (!config.pterodactyl.sellers) config.pterodactyl.sellers = [];
  if (!db.data.owner) db.data.owner = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbOwners = getJadibotOwners(jadibotId);
      if (jbOwners.length === 0) {
        return m.reply(
          `📋 *LISTA DE PROPIETARIOS DEL JADIBOT*\n\n> Aún no hay propietarios registrados.\n> Usa \`${m.prefix}addowner\` para añadir uno.`,
        );
      }
      let txt = `📋 *LISTA DE PROPIETARIOS DEL JADIBOT* — ${jadibotId}\n\n`;
      const mentions = jbOwners.map(toMentionJid).filter(Boolean);
      jbOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. @${number}\n`;
      });
      txt += `\nTotal: *${jbOwners.length}* propietarios`;
      return m.reply(txt, { mentions });
    } else if (isCpanelMode) {
      const panelOwners = config.pterodactyl.ownerPanels || [];
      const fullOwners = db.data.owner || [];
      const allOwners = [...new Set([...panelOwners, ...fullOwners])];

      if (allOwners.length === 0) {
        return m.reply(
          `📋 *LISTA DE PROPIETARIOS DEL PANEL*\n\n> Aún no hay propietarios del panel registrados.`,
        );
      }
      let txt = `📋 *LISTA DE PROPIETARIOS DEL PANEL*\n\n`;
      const mentions = allOwners.map(toMentionJid).filter(Boolean);
      allOwners.forEach((s, i) => {
        const label =
          panelOwners.includes(s) && fullOwners.includes(s)
            ? "👑🖥️"
            : fullOwners.includes(s)
              ? "👑"
              : "🖥️";
        const number = String(s || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. ${label} @${number}\n`;
      });
      txt += `\nTotal: *${allOwners.length}* propietarios | 👑 Completo, 🖥️ Panel`;
      return m.reply(txt, { mentions });
    } else {
      const fullOwners = db.data.owner || [];
      if (fullOwners.length === 0) {
        return m.reply(
          `📋 *LISTA DE PROPIETARIOS COMPLETOS*\n\n> Aún no hay propietarios completos registrados.`,
        );
      }
      let txt = `📋 *LISTA DE PROPIETARIOS COMPLETOS*\n\n`;
      const mentions = fullOwners.map(toMentionJid).filter(Boolean);
      fullOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. 👑 @${number}\n`;
      });
      txt += `\nTotal: *${fullOwners.length}* propietarios`;
      return m.reply(txt, { mentions });
    }
  }

  const targetNumber = await extractNumber(m);

  if (!targetNumber) {
    return m.reply(
      `👑 *${isAdd ? "AÑADIR" : "ELIMINAR"} PROPIETARIO*\n\n` +
        `Responde, etiqueta o escribe el número del usuario\n` +
        `\`Ejemplo: ${m.prefix}${cmd} 6281234567890\``,
    );
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌ *ERROR*\n\n> El formato del número no es válido`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (addJadibotOwner(jadibotId, targetNumber)) {
        await m.react("👑");
        return m.reply(
          `✅ *${targetNumber}* se ha añadido correctamente como propietario del jadibot`,
        );
      } else {
        return m.reply(
          `❌ \`${targetNumber}\` ya es propietario de este Jadibot.`,
        );
      }
    } else if (isDel) {
      if (removeJadibotOwner(jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅ *${targetNumber}* se ha eliminado correctamente de los propietarios del jadibot`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\` no es propietario de este Jadibot.`);
      }
    }
    return;
  }

  if (isCpanelMode) {
    if (isAdd) {
      if (config.pterodactyl.ownerPanels.includes(targetNumber)) {
        return m.reply(`❌ \`${targetNumber}\` ya es propietario del panel.`);
      }

      let roleChanged = "";
      if (removeFromSellers(targetNumber)) {
        roleChanged = `\n> ⚡ Cambio automático de Vendedor a Propietario del Panel`;
      }

      config.pterodactyl.ownerPanels.push(targetNumber);
      if (savePanelConfig()) {
        await m.react("👑");
        return m.reply(
          `✅ *${targetNumber}* se ha añadido correctamente como propietario del panel${roleChanged}`,
        );
      } else {
        config.pterodactyl.ownerPanels = config.pterodactyl.ownerPanels.filter(
          (s) => s !== targetNumber,
        );
        return m.reply(`❌ No se pudo guardar en config.js`);
      }
    } else if (isDel) {
      const ownerList = config.pterodactyl.ownerPanels || [];
      const found = ownerList.find(
        (o) => String(o).trim() === String(targetNumber).trim(),
      );
      if (!found) {
        return m.reply(
          `❌ \`${targetNumber}\` no es propietario del panel.\n\n> Lista actual: ${ownerList.join(", ") || "vacía"}`,
        );
      }
      config.pterodactyl.ownerPanels = ownerList.filter(
        (s) => String(s).trim() !== String(targetNumber).trim(),
      );
      if (savePanelConfig()) {
        await m.react("✅");
        return m.reply(
          `✅ *${targetNumber}* se ha eliminado correctamente de los propietarios del panel`,
        );
      } else {
        return m.reply(`❌ No se pudo guardar en config.js`);
      }
    }
  } else {
    if (isAdd) {
      if (db.data.owner.includes(targetNumber)) {
        return m.reply(`❌ \`${targetNumber}\` ya es propietario completo.`);
      }

      let roleChanged = "";
      if (removeFromSellers(targetNumber)) {
        roleChanged = `\n> ⚡ Cambio automático de Vendedor`;
        savePanelConfig();
      }
      if (removeFromOwnerPanels(targetNumber)) {
        roleChanged = `\n> ⚡ Cambio automático de Propietario del Panel`;
        savePanelConfig();
      }

      db.data.owner.push(targetNumber);
      db.save();

      await m.react("👑");
      return m.reply(
        `✅ *${targetNumber}* se ha añadido correctamente como propietario completo${roleChanged}`,
      );
    } else if (isDel) {
      const index = db.data.owner.indexOf(targetNumber);
      if (index === -1) {
        return m.reply(`❌ \`${targetNumber}\` no es propietario completo.`);
      }

      db.data.owner.splice(index, 1);
      db.save();

      await m.react("✅");
      return m.reply(`✅ *${targetNumber}* se ha eliminado correctamente de los propietarios completos`);
    }
  }
}

export {
  pluginConfig as config,
  handler,
  removeFromSellers,
  removeFromOwnerPanels,
};
