import {
  cacheParticipantLids,
  getCachedJid,
  isLid,
  isLidConverted,
  lidToJid,
} from "../../src/lib/ourin-lid.js";
import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { createGoodbyeCard } from "../../src/lib/ourin-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/ourin-lid.js";
import path from "path";
import fs from "fs";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "goodbye",
  alias: ["bye", "leave"],
  category: "group",
  description: "Establecer el mensaje de despedida para el grupo",
  usage: ".goodbye <on/off>",
  example: ".goodbye on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
// eslint-disable-next-line require-await
async function buildGoodbyeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const farewells = [
    `Adiós`,
    `Adiós.`,
    `Bye bye`,
    `Hasta luego`,
    `See you`,
    `Ten cuidado`,
    `Oyasumi~`,
  ];
  const quotes = [
    `Que tus pasos siempre sean rebajados delante de él.`,
    `Gracias por ser parte de este grupo.`,
    `Espero que nos veamos otra vez.`,
    `La puerta siempre está abierta cuando vuelve.`,
    `Cuidado muy bien, tomodachi.`,
    `Los recuerdos aquí permanecerán.`,
  ];
  const emojis = ["🌙", "👋", "🥀", "💫", "😢", "🤍"];
  const headers = [
    `🌙 Oyasumi~ minna-san...
Hoy un tomodachi debe despedirse.
Que su nuevo camino esté lleno de cosas buenas.`,
    `🥀 Minna-san...
Hoy hay un pequeño adiós.
Gracias por caminar conmigo.`,
    `💫 Adiós~
Esto no es el final; nos veremos de nuevo.
Que tus días estén llenos de alegría.`,
    `🌌 Minna-san...
Una estrella se mueve por el cielo esta noche.
Deséale suerte.`,
  ];
  const farewell = farewells[Math.floor(Math.random() * farewells.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "User";
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "domingo",
    Monday: "lunes",
    Tuesday: "martes",
    Wednesday: "miércoles",
    Thursday: "jueves",
    Friday: "viernes",
    Saturday: "sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  if (customMsg) {
    return customMsg
      .replace(/{user}/gi, `@${username}`)
      .replace(/{number}/gi, username)
      .replace(/{group}/gi, groupName || "Grupo")
      .replace(/{desc}/gi, groupDesc || "")
      .replace(/{count}/gi, memberCount?.toString() || "0")
      .replace(/{owner}/gi, groupOwner || "Admin")
      .replace(/{date}/gi, now.format("DD/MM/YYYY"))
      .replace(/{time}/gi, now.format("HH:mm"))
      .replace(/{day}/gi, dayId)
      .replace(/{bot}/gi, config.bot?.name || "Ourin")
      .replace(/{prefix}/gi, prefix);
  }
  return `
${header}
${emoji} ${farewell}, *@${username}* 🤍
╭─〔 📌 *ɪɴꜰᴏ ɢʀᴏᴜᴘ* 〕─✧
│ 🏠 *Nombre*        : \`${groupName}\`
│ 👥 *Miembros restantes* : ${memberCount}
│ 📅 *Fecha*       : ${now.format("DD/MM/YYYY")}
╰──────────────────────✦
💌 *Mensaje*
「 ${quote} 」
🌸 _Hasta luego, Tomodachi._ 🤍
`;
}
async function sendGoodbyeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.goodbye !== true && groupData?.leave !== true) return false;
    const goodbyeType = db.setting("goodbyeType") || 1;
    if (groupMeta?.participants) {
      cacheParticipantLids(groupMeta.participants);
    }
    let realParticipant = participant;
    const cachedJid = getCachedJid(participant);
    if (cachedJid && !isLidConverted(cachedJid)) {
      realParticipant = cachedJid;
    } else if (isLid(participant)) {
      const lidFormat = participant;
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      } else {
        realParticipant = lidToJid(participant);
      }
    } else if (isLidConverted(participant)) {
      const lidNumber = participant.replace("@s.whatsapp.net", "");
      const lidFormat = lidNumber + "@lid";
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      }
    }
    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "User";
    let ppUrl =
      "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = (await sock.profilePictureUrl(realParticipant, "image")) || ppUrl;
    } catch {}
    const text = await buildGoodbyeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.goodbyeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";
    if (goodbyeType === 2) {
      await sock.sendMessage(groupJid, {
        text: "¡Nos vemos!",
        title: `Goodbye ${userName}`,
        subtitle: groupName,
        footer: `Miembros restantes: ${memberCount}`,
        cards: [
          {
            image: { url: ppUrl },
            title: `Adiós, ${userName}!`,
            body: `Gracias por acompañarnos. ${groupName}`,
            footer: "¡Que siempre te vaya bien!~",
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "👋 Adiós.",
                  id: "bye",
                }),
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "🌐 Website",
                  url: config.info?.website || "https://sc.ourin.my.id/",
                }),
              },
            ],
          },
        ],
      });
    } else if (goodbyeType === 3) {
      await sock.sendMessage(groupJid, {
        image: { url: ppUrl },
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 9999,
          isForwarded: true,
          externalAdReply: {
            title: `Goodbye ${userName}`,
            body: `Miembros restantes: ${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl:
              config.saluran?.link ||
              "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
    } else if (goodbyeType === 4) {
      await sock.sendMessage(groupJid, {
        text: `*Adiós* @${userName} 👋`,
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 9,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: config?.saluran?.name,
            newsletterJid: config?.saluran?.id,
          },
          externalAdReply: {
            title: `WELCOME 👋`,
            body: `Miembro...${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl: config.info?.grupwa || "",
            mediaUrl: config.info?.grupwa || "",
            mediaType: 2,
            // renderLargerThumbnail: true
          },
        },
      });
    } else if (goodbyeType === 5) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 9,
          isForwarded: true,
          externalAdReply: {
            title: `Goodbye 👋`,
            body: `Miembro...${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
    } else {
      let canvasBuffer = null;
      try {
        canvasBuffer = await createGoodbyeCard(
          userName,
          ppUrl,
          groupName,
          memberCount.toLocaleString(),
        );
      } catch (e) {
        console.error("Goodbye Canvas Error:", e.message);
      }
      await sock.sendMessage(groupJid, {
        image: canvasBuffer,
        caption: text,
        mentions: [realParticipant],
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
          externalAdReply: {
            sourceUrl: config.info?.website || "https://sc.ourin.my.id/",
            mediaUrl: config.info?.website || "https://sc.ourin.my.id/",
            mediaType: 3,
            thumbnailUrl: ppUrl,
            title: `Goodbye ${userName}`,
            body: null,
            renderLargerThumbnail: false,
          },
        },
      });
    }
    return true;
  } catch (error) {
    console.error("Goodbye Error:", error);
    return false;
  }
}
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.goodbye === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ ¡Sólo el propietario podría usar esta característica!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: true, leave: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
          `> Despedida activada en *${count}¡* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌ ¡Sólo el propietario podría usar esta característica!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: false, leave: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
          `> Goodbye fue desactivado en *${count}¡* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ɢᴏᴏᴅʙʏᴇ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Status: *✅ ON*\n` +
          `> Goodbye ya están activos en este grupo.

` +
          `Usa \`${m.prefix}goodbye off\` para desactivar._`,
      );
    }
    db.setGroup(m.chat, { goodbye: true, leave: true });
    return m.reply(
      `✅ *DESPEDIDA ACTIVADA*\n\n` +
        `> ¡El mensaje de despedida se activó correctamente!
` +
        `El miembro que salga recibirá un mensaje.

` +
        `Usa \`${m.prefix}setgoodbye\` para el mensaje de personalizado._`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ɢᴏᴏᴅʙʏᴇ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Status: *❌ OFF*\n` +
          `> Goodbye ya están inactivos en este grupo.

` +
          `Usa \`${m.prefix}goodbye on\` para activar._`,
      );
    }
    db.setGroup(m.chat, { goodbye: false, leave: false });
    return m.reply(
      `❌ *DESPEDIDA DESACTIVADA*\n\n` +
        `> El mensaje de despedida fue desactivado correctamente.
` +
        `Los miembros que salgan no recibirán un mensaje.`,
    );
  }
  m.reply(
    `👋 *ɢᴏᴏᴅʙʏᴇ sᴇᴛᴛɪɴɢs*\n\n` +
      `> Status: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
      `> \`${m.prefix}goodbye on\` → Activa
` +
      `> \`${m.prefix}goodbye off\` → Desactiva
` +
      `> \`${m.prefix}goodbye on all\` → Global ON (owner)\n` +
      `> \`${m.prefix}goodbye off all\` → Global OFF (owner)\n` +
      `> \`${m.prefix}setgoodbye\` → Personalizar el mensaje
` +
      `> \`${m.prefix}resetgoodbye\` → Restablecer el valor predeterminado`,
  );
}
export { pluginConfig as config, handler, sendGoodbyeMessage };
