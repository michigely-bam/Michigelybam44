import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { createWideDiscordCard } from "../../src/lib/ourin-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/ourin-lid.js";
import path from "path";
import fs from "fs";
import axios from "axios";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "welcome",
  alias: ["wc"],
  category: "group",
  description: "Establecer mensaje de bienvenida para el grupo",
  usage: ".welcome <on/off>",
  example: ".welcome on",
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
async function buildWelcomeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const greetings = [
    `Por fin llegó`,
    `Bienvenido.`,
    `Welcome`,
    `Hola`,
    `Saludos`,
    `Yokoso~`,
    `Ohayou~`,
  ];
  const quotes = [
    `¡No seas un lector silencioso!`,
    `¡Relájate, siéntete como en casa!`,
    `¡Vamos a hablar de gas!`,
    `¡Prepárense para divertirse juntos!`,
    `¡No seas tímido, todos somos amigos!`,
    `Si tienes dudas, saluda primero. 😄`,
  ];
  const emojis = ["🎐", "🌸", "✨", "💫", "🪸", "🔥", "💖"];
  const headers = [
    `🎐 Ohayou~ minna-san!
Hoy tenemos una nueva tomodachi 🌱
¡Démosle la bienvenida juntos!`,
    `🌸 Ohayou minna-san!
Por fin se unió un nuevo amigo ✨
Que te quedes bien y siéntate.~`,
    `✨ Ohayou~!
Tomodachi acaba de venir con una nueva vibración. 💫
Yoroshiku ne~ ¡vamos a divertirnos juntos!`,
    `🪸 Ohayou minna-san!
Este grupo tiene una familia más 🤍
Tanoshii jikan o issho ni sugoso ne~`,
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
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
  let msg = `
${header}
${emoji} ${greeting}, *@${username}* 💫
╭─〔 📌 *ɪɴꜰᴏ ɢʀᴏᴜᴘ* 〕─✧
│ 🏠 *Nombre*     : \`${groupName}\`
│ 👥 *Miembros*  : ${memberCount}
│ 📅 *Fecha*      : ${moment().tz("Asia/Jakarta").format("DD/MM/YYYY")}
╰──────────────────────✦
`;
  if (groupDesc) {
    msg += `
📝 *Descripción*
❝ ${groupDesc.slice(0, 120)}${groupDesc.length > 120 ? "..." : ""} ❞
`;
  }
  msg += `
✨ *Consejos actuales*
「 ${quote} 」
🌸 _Yoroshiku ne~ ¡esperamos que te sientas a gusto!_ 🤍
`;
  return msg;
}
async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.welcome !== true) return false;
    const welcomeType = db.setting("welcomeType") || 1;
    const realParticipant = resolveAnyLidToJid(
      participant,
      groupMeta?.participants || [],
    );
    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "User";
    let ppUrl =
      "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = await sock.profilePictureUrl(realParticipant, "image");
    } catch {}
    const text = await buildWelcomeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.welcomeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";
    if (welcomeType === 2) {
      await sock.sendMessage(groupJid, {
        text: `Welcome *${userName}* 
Bienvenido al grupo. *${groupName}*`,
        title: ``,
        subtitle: groupName,
        footer: `Miembro...${memberCount}`,
        cards: [
          {
            image: { url: ppUrl },
            body: `Bienvenido a ${groupName}`,
            footer: "Esperamos que te sientas a gusto~",
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "👋 Halo " + "@" + userName,
                  id: "hi",
                }),
              },
            ],
          },
        ],
      });
    } else if (welcomeType === 3) {
      // Type 3: Image (PP) + Caption + Metadata
      await sock.sendMessage(groupJid, {
        image: { url: ppUrl },
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: `Welcome ${userName}`,
            body: `Miembro...${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl:
              config.saluran?.link ||
              "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
    } else if (welcomeType === 4) {
      await sock.sendMessage(groupJid, {
        text: `*Halo* @${userName} 👋
Bienvenido al grupo *${groupName}* 🌸`,
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 9,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: config?.saluran?.name,
            newsletterJid: config?.saluran?.id,
          },
          externalAdReply: {
            title: `Bienvenido. 👋`,
            body: `Miembro...${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl: config.info?.grupwa || "",
            mediaUrl: config.info?.grupwa || "",
            mediaType: 2,
            // renderLargerThumbnail: true
          },
        },
      });
    } else if (welcomeType === 5) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          mentionedJid: [realParticipant],
          forwardingScore: 9,
          isForwarded: true,
          externalAdReply: {
            title: `Bienvenido. 👋`,
            body: `Miembro...${memberCount}`,
            thumbnailUrl: ppUrl,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      });
    } else {
      await sock.sendMessage(groupJid, {
        text: text,
        mentions: [realParticipant],
      });
    }
    return true;
  } catch (error) {
    console.error("Welcome Error:", error);
    return false;
  }
}
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.welcome === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(config.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
          `> Bienvenida activada en *${count}¡* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(config.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
          `> Welcome fue desactivado en *${count}¡* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ᴡᴇʟᴄᴏᴍᴇ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Status: *✅ ON*\n` +
          `> Welcome ya están activos en este grupo.

` +
          `Usa \`${m.prefix}welcome off\` para desactivar._`,
      );
    }
    db.setGroup(m.chat, { welcome: true });
    return m.reply(
      `✅ *BIENVENIDA ACTIVADA*\n\n` +
        `> ¡El mensaje de bienvenida se activó correctamente!
` +
        `Los nuevos miembros serán recibidos automáticamente.

` +
        `Usa \`${m.prefix}setwelcome\` para el mensaje de personalizado._`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ᴡᴇʟᴄᴏᴍᴇ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Status: *❌ OFF*\n` +
          `> Welcome ya están inactivos en este grupo.

` +
          `Usa \`${m.prefix}welcome on\` para activar._`,
      );
    }
    db.setGroup(m.chat, { welcome: false });
    return m.reply(
      `❌ *BIENVENIDA DESACTIVADA*\n\n` +
        `> El mensaje de bienvenida fue desactivado correctamente.
` +
        `Los nuevos miembros no serán bienvenidos.`,
    );
  }
  m.reply(
    `👋 *ᴡᴇʟᴄᴏᴍᴇ sᴇᴛᴛɪɴɢs*\n\n` +
      `> Status: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ OPCIONES ━━━\`\`\`\n` +
      `> \`${m.prefix}welcome on\` → Activa
` +
      `> \`${m.prefix}welcome off\` → Desactiva
` +
      `> \`${m.prefix}welcome on all\` → Global ON (owner)\n` +
      `> \`${m.prefix}welcome off all\` → Global OFF (owner)\n` +
      `> \`${m.prefix}setwelcome\` → Personalizar el mensaje
` +
      `> \`${m.prefix}resetwelcome\` → Restablecer el valor predeterminado`,
  );
}
export { pluginConfig as config, handler, sendWelcomeMessage };
