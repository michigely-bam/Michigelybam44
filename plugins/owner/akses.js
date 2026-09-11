import { getDatabase } from "../../src/lib/ourin-database.js";
import ms from "ms";
const pluginConfig = {
  name: "akses",
  alias: [
    "addakses",
    "delakses",
    "listakses",
    "addaccess",
    "delaccess",
    "listaccess",
  ],
  category: "owner",
  description: "Concede acceso temporal o permanente a comandos para usuarios",
  usage: ".addakses <cmd> <duración> <usuario>",
  example: ".addakses addowner 30d @user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugins }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();
  const isAdd = ["addakses", "addaccess"].includes(cmd);
  const isDel = ["delakses", "delaccess"].includes(cmd);
  const isList = ["listakses", "listaccess"].includes(cmd);
  let target = m.mentionedJid?.[0];
  if (!target && m.quoted) target = m.quoted.sender;
  if (!target && m.args.length > 0) {
    for (const arg of m.args) {
      if (/^\d{5,15}$/.test(arg)) {
        target = arg + "@s.whatsapp.net";
        break;
      } else if (/^@\d+/.test(arg)) {
        target = arg.replace("@", "") + "@s.whatsapp.net";
        break;
      }
    }
  }
  let commandTarget = null;
  let durationTarget = null;
  if (isAdd) {
    if (!target)
      return m.reply(
        `❌ *Objetivo no válido*\n\nEtiqueta al usuario / Responde al chat / Escribe el número del objetivo`,
      );
    const cleanArgs = m.args.filter(
      (a) => !a.includes("@") && !/^\d{10,}$/.test(a),
    );
    if (cleanArgs.length < 2) {
      return m.reply(
        `⚠️ *Formato incorrecto*\n\n` +
          `Formato: \`${m.prefix}addakses <comando> <duración> <objetivo>\`\n\n` +
          `*Ejemplo:*\n` +
          `> \`${m.prefix}addakses addowner 30d @user\` (30 días)\n` +
          `> \`${m.prefix}addakses unban permanent @user\` (Para siempre)\n\n` +
          `*Duraciones compatibles:* 1h, 1d, 30d, 1y`,
      );
    }
    commandTarget = cleanArgs[0].toLowerCase();
    durationTarget = cleanArgs[1].toLowerCase();
  }

  const user = db.getUser(target) || {};
  if (!user.access) user.access = [];
  if (isList) {
    if (!target) target = m.sender;
    const targetData = db.getUser(target) || {};
    const accessList = targetData.access || [];
    const now = Date.now();
    const activeAccess = accessList.filter(
      (a) => a.expired === null || a.expired > now,
    );
    if (activeAccess.length !== accessList.length) {
      targetData.access = activeAccess;
      db.setUser(target, targetData);
    }

    if (activeAccess.length === 0) {
      return m.reply(
        `📊 *ACCESO DEL USUARIO*\n\nObjetivo: @${target.split("@")[0]}\nEstado: *No tiene accesos especiales*`,
        {
          mentions: sock.parseMention(`@${target.split("@")[0]}`),
        },
      );
    }

    let txt = `📊 *ACCESO DEL USUARIO*\n\n`;
    txt += `Objetivo: @${target.split("@")[0]}\n`;
    txt += `Total: *${activeAccess.length}* comandos\n`;
    txt += `━━━━━━━━━━━━━━━\n\n`;

    activeAccess.forEach((acc, i) => {
      let expiredTxt = "♾️ Permanente";
      if (acc.expired) {
        const timeLeft = acc.expired - now;
        if (timeLeft > 0) {
          expiredTxt = "🕕 " + ms(timeLeft, { long: true });
        } else {
          expiredTxt = "🔴 Expirado";
        }
      }

      txt += `${i + 1}. *${acc.cmd}*\n`;
      txt += `   └ ${expiredTxt}\n`;
    });

    return m.reply(txt, { mentions: [target] });
  }
  if (isAdd) {
    let expiredTime = null;
    if (durationTarget !== "permanent" && durationTarget !== "perm") {
      try {
        const durationMs = ms(durationTarget);
        if (!durationMs)
          return m.reply(`❌ Formato de duración incorrecto. Usa: 1h, 1d, 30d`);
        expiredTime = Date.now() + durationMs;
      } catch {
        return m.reply(`❌ No se reconoce el formato de duración`);
      }
    }

    const existingIdx = user.access.findIndex((a) => a.cmd === commandTarget);
    if (existingIdx !== -1) {
      user.access[existingIdx].expired = expiredTime;
      db.setUser(target, user);
      return m.reply(
        `✅ *ACCESO ACTUALIZADO*\n\n` +
          `Comando: \`${commandTarget}\`\n` +
          `Duración: *${durationTarget}*\n` +
          `Objetivo: @${target.split("@")[0]}`,
      );
    }
    user.access.push({
      cmd: commandTarget,
      expired: expiredTime,
    });

    // console.log('[DEBUG AddAccess] Saving user with access:', JSON.stringify(user.access))
    db.setUser(target, user);
    // console.log('[DEBUG AddAccess] After save:', JSON.stringify(db.getUser(target)?.access))

    await m.reply(
      `✅ *ACCESO CONCEDIDO*\n\n` +
        `┃ 🔑 ᴄᴍᴅ: \`${commandTarget}\`\n` +
        `┃ ⏱️ ᴅᴜʀᴀᴄɪóɴ: *${durationTarget}*\n` +
        `┃ 👤 ᴏʙᴊᴇᴛɪᴠᴏ: @${target.split("@")[0]}\n`,
      { mentions: [target] },
    );
  }
  if (isDel) {
    if (!target) return m.reply(`❌ Etiqueta al usuario al que quieres quitarle el acceso`);
    const now = Date.now();
    const activeAccess = user.access.filter(
      (a) => a.expired === null || a.expired > now,
    );
    let specificCmd = m.args.find((a) => !a.includes("@") && !/^\d+$/.test(a));
    if (specificCmd) {
      specificCmd = specificCmd.toLowerCase();
      const idx = user.access.findIndex((a) => a.cmd === specificCmd);
      if (idx === -1)
        return m.reply(`❌ El usuario no tiene acceso al comando \`${specificCmd}\``);

      user.access.splice(idx, 1);
      db.setUser(target, user);
      return m.reply(
        `✅ El acceso a \`${specificCmd}\` se ha revocado correctamente para @${target.split("@")[0]}`,
      );
    }

    if (activeAccess.length === 0) {
      return m.reply(`⚠️ Este usuario no tiene acceso a ningún comando.`);
    }
    const rows = activeAccess.map((acc) => {
      const exp = acc.expired ? ms(acc.expired - now) : "Permanente";
      return {
        title: `Eliminar: ${acc.cmd}`,
        description: `Duración restante: ${exp}`,
        id: `${m.prefix}delakses ${acc.cmd} ${target}`,
      };
    });
    const listMessage = {
      text: `🔓 *REVOCAR ACCESO*\n\nSelecciona el acceso al comando que deseas eliminar de @${target.split("@")[0]}`,
      title: "Gestionar acceso",
      buttonText: "SELECCIONAR COMANDO",
      sections: [
        {
          title: "Lista de accesos activos",
          rows: rows,
        },
      ],
    };

    return sock.sendMessage(m.chat, listMessage, { quoted: m });
  }
}

export { pluginConfig as config, handler };
