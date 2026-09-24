import config from "../../config.js";
import * as timeHelper from "../../src/lib/ourin-time.js";
import { CronJob } from "cron";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { fetchGroupsSafe } from "../../src/lib/ourin-jpm-helper.js";

function generateGiveawayId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "GA-";
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function parseTime(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

function formatDuration(ms) {
  if (ms < 60000) return `${Math.floor(ms / 1000)} segundos`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)} minutos`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)} horas`;
  return `${Math.floor(ms / 86400000)} días`;
}

function getCtx() {
  const saluranId = config.saluran?.id || "";
  const saluranName = config.saluran?.name || config.bot?.name || "";
  const ctx = { forwardingScore: 1, isForwarded: true };
  if (saluranId && saluranId !== "-@newsletter") {
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: Math.floor(Math.random() * 1000) + 1,
    };
  }
  return ctx;
}

if (!global.giveawaySessions) global.giveawaySessions = new Map();
const createSessions = global.giveawaySessions;

function hasActiveSession(senderJid) {
  return createSessions.has(senderJid);
}

async function handleSession(m, sock) {
  const session = createSessions.get(m.sender);
  if (!session) return false;

  const text = (m.body || m.text || "").trim();
  if (!text) return false;

  if (session.step === "q1") {
    const parts = text.split("|").map((s) => s.trim());
    if (parts.length < 3) return true;

    const [title, durationStr, winnersStr] = parts;
    const duration = parseTime(durationStr);
    if (!duration) return true;

    const winners = parseInt(winnersStr);
    if (isNaN(winners) || winners < 1) return true;

    session.title = title;
    session.duration = duration;
    session.winners = winners;
    session.step = "q2";

    await m.reply(
      `✅ ¡Detalles guardados!
┃ 🎁 ${title}\n┃ ⏱️ ${formatDuration(duration)}\n┃ 👥 ${winners} ganador

_Lista de grupos de recuperación ..._`,
    );

    try {
      const rawGroups = await fetchGroupsSafe(sock);
      const groups = Array.isArray(rawGroups)
        ? rawGroups
        : Object.values(rawGroups);
      const currentGroup = session.chatId;
      const otherGroups = groups.filter((g) => g.id !== currentGroup);

      const buttons = [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "📍 En este grupo",
            id: `.giveaway selectgroup ${currentGroup}`,
          }),
        },
      ];

      if (otherGroups.length > 0) {
        const sections = [
          {
            title: "Seleccionar grupo",
            rows: otherGroups.slice(0, 10).map((g) => ({
              title: g.subject || g.id,
              id: `.giveaway selectgroup ${g.id}`,
            })),
          },
        ];
        buttons.push({
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "Seleccionar otro grupo",
            sections,
          }),
        });
      }

      await sock.sendButton(
        m.chat,
        null,
        "🎁 *GIVEAWAY CREATOR*\n\nPregunta 2/3:\n¿Quieres huir en este grupo o en cualquier otro grupo?",
        m,
        { buttons, footer: "Seleccionar grupo para el sorteo" },
      );
    } catch (e) {
      session.groupId = currentGroup;
      session.step = "q3";
      await m.reply("⚠️ No se pudo retrieve group list. Usando este grupo.");
      await askPrizeDetails(m, sock, session);
    }
    return true;
  }

  if (session.step === "q3") {
    const parts = text.split("|").map((s) => s.trim());
    if (parts.length < 2) return true;

    const [prizeName, ...detailParts] = parts;
    session.prizeName = prizeName;
    session.prizeDetails = detailParts.join(" | ");

    await m.reply("✅ ¡Detalles del premio guardados! Creando el sorteo...");

    await createGiveaway(session, sock, m);
    createSessions.delete(m.sender);
    return true;
  }

  return false;
}

async function askPrizeDetails(m, sock, session) {
  try {
    const adminJid = session.adminJid;
    await sock.sendMessage(
      adminJid,
      {
        text:
          "🎁 *GIVEAWAY CREATOR*\n\n" +
          "Pregunta 3/3:\nIndica los detalles del premio con este formato:\n" +
          "nombre del regalo detalles del regalo\n\n" +
          "Ejemplo: Premium Account | Email: xxx@gmail.com | Password: xxx",
        contextInfo: getCtx(),
      },
      { quoted: m },
    );
  } catch (e) {
    await m.reply("⚠️ No se pudo send PM. Por favor, charla el bot primero y repetir.");
    createSessions.delete(session.adminJid);
  }
}

async function createGiveaway(session, sock, m) {
  const db = getDatabase();
  const giveaways = db.setting("giveaways") || {};
  const giveawayId = generateGiveawayId();

  const giveaway = {
    giveawayId,
    chatId: session.groupId,
    title: session.title,
    duration: session.duration,
    endTime: Date.now() + session.duration,
    winners: session.winners,
    prizeName: session.prizeName,
    prizeDetails: session.prizeDetails,
    participants: [],
    winnerList: [],
    ended: false,
    giveawayMsgId: null,
    createdBy: session.adminJid,
    createdAt: Date.now(),
  };

  giveaways[giveawayId] = giveaway;
  db.setting("giveaways", giveaways);

  const endTimeFormatted = timeHelper.fromTimestamp(
    giveaway.endTime,
    "DD/MM/YYYY HH:mm",
  );
  const remaining = formatDuration(giveaway.duration);

  const giveawayText =
    "🎉 *G I V E A W A Y*\n\n" +
    `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
    `┃ 🎁 ᴛɪᴛʟᴇ: *${giveaway.title}*\n` +
    `┃ 🏆 PREMIO: *${giveaway.prizeName}*\n` +
    `┃ 👥 GANADOR: ${giveaway.winners}\n` +
    `┃ ⏰ FINALIZADO: ${endTimeFormatted}\n` +
    `┃ ⏱️ DURACIÓN: ${remaining}\n` +
    `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
    `╰┈┈⬡\n\n` +
    `¡> Haga clic en el botón *Join* para participar en el giveaway!`;

  const joinButton = [
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🎉 Join",
        id: `.giveaway join ${giveawayId}`,
      }),
    },
  ];

  try {
    const sentMsg = await sock.sendButton(
      giveaway.chatId,
      null,
      giveawayText,
      null,
      {
        buttons: joinButton,
        footer: "Click Join para participar",
        contextInfo: getCtx(),
      },
    );

    giveaway.giveawayMsgId = sentMsg?.key?.id || null;
    giveaways[giveawayId] = giveaway;
    db.setting("giveaways", giveaways);
  } catch (e) {
    giveaway.giveawayMsgId = null;
    giveaways[giveawayId] = giveaway;
    db.setting("giveaways", giveaways);
  }

  await sock.sendMessage(
    session.adminJid,
    {
      text: "✅ Giveaway creado con éxito! Compruebe los mensajes de regalo en el grupo seleccionado.",
      contextInfo: getCtx(),
    },
    { quoted: m },
  );
}

async function endGiveaway(giveawayId, sock, db) {
  const giveaways = db.setting("giveaways") || {};
  const giveaway = giveaways[giveawayId];
  if (!giveaway || giveaway.ended) return;

  giveaway.ended = true;

  if (giveaway.participants.length === 0) {
    giveaway.winnerList = [];
    db.setting("giveaways", giveaways);

    await sock.sendMessage(giveaway.chatId, {
      text:
        `😔 *SORTEO FINALIZADO*

` +
        `Giveaway *${giveaway.title}*terminó sin participantes.

` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
        `┃ 👥 PARTICIPANTES: 0
` +
        `╰┈┈⬡`,
      contextInfo: getCtx(),
    });
    return;
  }

  const winnerCount = Math.min(giveaway.winners, giveaway.participants.length);
  const shuffled = [...giveaway.participants].sort(() => Math.random() - 0.5);
  giveaway.winnerList = shuffled.slice(0, winnerCount);
  db.setting("giveaways", giveaways);

  const winnerText = giveaway.winnerList
    .map((w, i) => `${i + 1}. @${w.split("@")[0]}`)
    .join("\n");

  const firstWinner = giveaway.winnerList[0];
  const fakeQuoted = {
    key: {
      id: `${Date.now()}@bot`,
      remoteJid: giveaway.chatId,
      participant: firstWinner,
      fromMe: false,
    },
    message: {
      conversation: "¡Sí, gané!",
    },
  };

  await sock.sendMessage(
    giveaway.chatId,
    {
      text:
        `🎊 *¡SORTEO FINALIZADO!*

` +
        `╭┈┈⬡「 🏆 *GANADOR* 」\n` +
        `${winnerText}\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 🎁 ᴛɪᴛʟᴇ: *${giveaway.title}*\n` +
        `┃ 🏆 PREMIO: *${giveaway.prizeName}*\n` +
        `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
        `┃ 👥 PARTICIPANTES: ${giveaway.participants.length}\n` +
        `╰┈┈⬡\n\n` +
        `¡> Premios enviados al chat privado ganador!`,
      contextInfo: { ...getCtx(), mentionedJid: giveaway.winnerList },
    },
    { quoted: fakeQuoted },
  );

  for (const winnerJid of giveaway.winnerList) {
    try {
      const winnerFakeQuoted = {
        key: {
          id: `${Date.now()}@bot`,
          remoteJid: giveaway.chatId,
          participant: winnerJid,
          fromMe: false,
        },
        message: {
          conversation: "¡Sí, gané!",
        },
      };
      const ctx = getCtx();
      ctx.mentionedJid = [winnerJid];
      await sock.sendMessage(
        winnerJid,
        {
          text:
            `🎉 *¡FELICIDADES!*

` +
            `¡Vinciste el giveaway!

` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 🎁 ᴛɪᴛʟᴇ: \`${giveaway.title}\`\n` +
            `┃ 🏆 PREMIO: *${giveaway.prizeName}*\n` +
            `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🎁 *DETALLES DEL PREMIO* 」\n` +
            `${giveaway.prizeDetails || "Póngase en contacto con el administrador para más detalles"}\n` +
            `╰┈┈⬡\n\n` +
            `Esta es la información oficial del bot.`,
          contextInfo: ctx,
        },
        { quoted: winnerFakeQuoted },
      );
    } catch (e) {}
  }
}

function startGiveawayChecker(sock, db) {
  new CronJob(
    "* * * * *",
    async () => {
      try {
        const { getDatabase } = await import("../../src/lib/ourin-database.js");
        const currentDb = getDatabase();
        const { getSocket } = await import("../../src/connection.js");
        const currentSock = getSocket();
        if (!currentSock) return;

        const giveaways = currentDb.setting("giveaways") || {};
        const now = Date.now();
        for (const [id, ga] of Object.entries(giveaways)) {
          if (!ga.ended && ga.endTime && now >= ga.endTime) {
            await endGiveaway(id, currentSock, currentDb);
          }
        }
      } catch (e) {}
    },
    null,
    true,
    "Asia/Jakarta",
  );
}

const createCmds = ["giveawaycreate", "gacreate", "buatgiveaway"];
const listCmds = ["giveawaylist", "galist", "listgiveaway"];
const deleteCmds = ["giveawaydelete", "gadelete", "hapusgiveaway"];
const rerollCmds = ["giveawayreroll", "gareroll", "ulangigiveaway"];

const plugin = {
  name: ["giveaway", ...createCmds, ...listCmds, ...deleteCmds, ...rerollCmds],
  alias: "ga",
  category: "group",
  description: "Sistema de regalo con botones interactivos",
  admin: false,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const cmd = m.command?.toLowerCase() || "";
  const prefix = m.prefix || ".";
  const args = m.args || [];

  if (createCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner)
      return m.reply("⚠️ ¡Sólo el administrador puede hacer un regalo!");
    if (!m.isGroup) return m.reply("⚠️ ¡Usadlo en el grupo!");
    if (createSessions.has(m.sender))
      return m.reply("⚠️ ¡Todavía tienes una sesión de creación activa!");

    createSessions.set(m.sender, {
      step: "q1",
      chatId: m.chat,
      adminJid: m.sender,
      title: null,
      duration: null,
      winners: null,
      groupId: null,
      prizeName: null,
      prizeDetails: null,
    });

    await m.reply(
      "🎁 *GIVEAWAY CREATOR*\n\n" +
        "Pregunta 1/3:\nIndica los detalles del sorteo con este formato:\n" +
        "Nombre de duración número de ganadores\n\n" +
        "Ejemplo: Premium Account | 5m | 1\n" +
        "Duración: 30 s, 5 min, 1 h, 1 d\n\n" +
        "> El bot se detiene si el formato es incorrecto",
    );
    return;
  }

  if (cmd === "giveaway" && args[0]?.toLowerCase() === "selectgroup") {
    const session = createSessions.get(m.sender);
    if (!session || session.step !== "q2") return;

    const groupId = args[1];
    if (!groupId) return;

    session.groupId = groupId;
    session.step = "q3";

    await m.reply(
      "✅ Grupo seleccionado! Cheque de chat privado para la siguiente pregunta.",
    );
    await askPrizeDetails(m, sock, session);
    return;
  }

  if (cmd === "giveaway" && args[0]?.toLowerCase() === "join") {
    const giveawayId = args[1];
    if (!giveawayId) return;

    const giveaways = db.setting("giveaways") || {};
    const giveaway = giveaways[giveawayId];
    if (!giveaway) return m.reply("⚠️ ¡No se ha encontrado a nadie!");
    if (giveaway.ended) return m.reply("⚠️ ¡El regalo ha terminado!");
    if (giveaway.participants.includes(m.sender))
      return m.reply("⚠️ ¡Ya te has unido!");

    giveaway.participants.push(m.sender);
    db.setting("giveaways", giveaways);

    await m.react("✅");
    await m.reply(
      `✅ @${m.sender.split("@")[0]} fontcolor = "# FFFF00" éxito únete a dar!${giveaway.participants.length} participantes)`,
    );
    return;
  }

  if (listCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner) return m.reply("⚠️ ¡Sólo admin!");
    const giveaways = db.setting("giveaways") || {};
    const entries = Object.values(giveaways);
    if (entries.length === 0) return m.reply("📋 Sin regalar.");

    const active = entries.filter((g) => !g.ended);
    const ended = entries.filter((g) => g.ended);

    let text = "📋 *GIVEAWAY LIGHT*\n\n";
    if (active.length > 0) {
      text += "🟢 *Activo:*\n";
      for (const g of active) {
        const endFmt = timeHelper.fromTimestamp(g.endTime, "DD/MM/YYYY HH:mm");
        text += `┃ 🆔 \`${g.giveawayId}\` — ${g.title} (${g.participants.length} participantes; finaliza ${endFmt})\n`;
      }
      text += "\n";
    }
    if (ended.length > 0) {
      text += "🔴 *Finaliza:*\n";
      for (const g of ended.slice(-5)) {
        text += `┃ 🆔 \`${g.giveawayId}\` — ${g.title} (${g.winnerList?.length || 0} ganador)
`;
      }
    }

    await m.reply(text);
    return;
  }

  if (deleteCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner) return m.reply("⚠️ ¡Sólo admin!");
    const giveawayId = args[0];
    if (!giveawayId) return m.reply(`⚠️ Formato: ${prefix}${cmd} GA-XXXXXX`);

    const giveaways = db.setting("giveaways") || {};
    if (!giveaways[giveawayId]) return m.reply("⚠️ ¡No se ha encontrado a nadie!");

    delete giveaways[giveawayId];
    db.setting("giveaways", giveaways);
    await m.reply(`✅ Giveaway \`${giveawayId}\` ¡Se ha borrado!`);
    return;
  }

  if (rerollCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner) return m.reply("⚠️ ¡Sólo admin!");
    const giveawayId = args[0];
    if (!giveawayId) return m.reply(`⚠️ Formato: ${prefix}${cmd} GA-XXXXXX`);

    const giveaways = db.setting("giveaways") || {};
    const giveaway = giveaways[giveawayId];
    if (!giveaway) return m.reply("⚠️ ¡No se ha encontrado a nadie!");
    if (!giveaway.ended) return m.reply("⚠️ ¡Daraway no ha terminado!");
    if (giveaway.participants.length === 0)
      return m.reply("⚠️ ¡No hay participantes!");

    const winnerCount = Math.min(
      giveaway.winners,
      giveaway.participants.length,
    );
    const shuffled = [...giveaway.participants].sort(() => Math.random() - 0.5);
    giveaway.winnerList = shuffled.slice(0, winnerCount);
    db.setting("giveaways", giveaways);

    const winnerText = giveaway.winnerList
      .map((w, i) => `${i + 1}. @${w.split("@")[0]}`)
      .join("\n");

    await sock.sendMessage(giveaway.chatId, {
      text:
        `🔄 *GIVEAWAY REROLL!*\n\n` +
        `╭┈┈⬡「 🏆 *NUEVO GANADOR* 」\n` +
        `${winnerText}\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 🎁 ᴛɪᴛʟᴇ: *${giveaway.title}*\n` +
        `┃ 🏆 PREMIO: *${giveaway.prizeName}*\n` +
        `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
        `╰┈┈⬡`,
      contextInfo: { ...getCtx(), mentionedJid: giveaway.winnerList },
    });

    for (const winnerJid of giveaway.winnerList) {
      try {
        const ctx = getCtx();
        ctx.mentionedJid = [winnerJid];
        await sock.sendMessage(winnerJid, {
          text:
            `🎉 *¡FELICIDADES!*

` +
            `¡Has ganado el giveaway!

` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 🎁 ᴛɪᴛʟᴇ: \`${giveaway.title}\`\n` +
            `┃ 🏆 PREMIO: *${giveaway.prizeName}*\n` +
            `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🎁 *DETALLES DEL PREMIO* 」\n` +
            `${giveaway.prizeDetails || "Póngase en contacto con el administrador para más detalles"}\n` +
            `╰┈┈⬡\n\n` +
            `Esta es la información oficial del bot.`,
          contextInfo: ctx,
        });
      } catch (e) {}
    }
    return;
  }

  if (cmd === "giveaway") {
    await m.reply(
      "🎁 *GIVEAWAY MENU*\n\n" +
        `┃ ${prefix}Giveawaycreate — Hacer un regalo
` +
        `┃ ${prefix}Giveawaylist — Ver la lista
` +
        `┃ ${prefix}Giveawaydelete — Eliminar el giveaway
` +
        `┃ ${prefix}giveawayreroll — Volver a sortear al ganador

` +
        `> Alias: ga, gacreate, galist, gadelete, gareroll`,
    );
    return;
  }
}

export {
  plugin as config,
  handler,
  startGiveawayChecker,
  hasActiveSession,
  handleSession,
};
