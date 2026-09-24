import axios from 'axios'
import crypto from 'crypto'
import config from '../../config.js'
import { isLid, lidToJid } from '../../src/lib/ourin-lid.js'
import { hasFullAccess, getUserRole, VALID_SERVERS } from '../../src/lib/ourin-roles-cpanel.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import te from '../../src/lib/ourin-error.js'
const allCommands = VALID_SERVERS.map((v) => `cadmin${v}`);
const allAliases = VALID_SERVERS.map((v) => `createadmin${v}`);

const pluginConfig = {
  name: allCommands,
  alias: allAliases,
  category: "panel",
  description: "Crear un nuevo administrador de panel (v1-v5)",
  usage: ".cadminv1 nombre de usuario o .cadminv2 nombre de usuario,628xxx",
  example: ".cadminv1 adminku,628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function cleanJid(jid) {
  if (!jid) return null;
  if (isLid(jid)) jid = lidToJid(jid);
  return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate() {
  return timeHelper.formatDateTime("D MMMM YYYY HH:mm");
}

function parseServerVersion(cmd) {
  const match = cmd.match(/v([1-5])$/i);
  if (!match) return { server: "v1", serverKey: "s1" };
  return { server: "v" + match[1], serverKey: "s" + match[1] };
}

function getServerConfig(pteroConfig, serverKey) {
  const serverConfigs = {
    s1: pteroConfig.server1,
    s2: pteroConfig.server2,
    s3: pteroConfig.server3,
    s4: pteroConfig.server4,
    s5: pteroConfig.server5,
  };
  return serverConfigs[serverKey] || null;
}

function validateConfig(serverConfig) {
  const missing = [];
  if (!serverConfig?.domain) missing.push("domain");
  if (!serverConfig?.apikey) missing.push("apikey (PTLA)");
  return missing;
}

function getAvailableServers(pteroConfig) {
  const available = [];
  for (let i = 1; i <= 5; i++) {
    const cfg = pteroConfig[`server${i}`];
    if (cfg?.domain && cfg?.apikey) available.push(`v${i}`);
  }
  return available;
}

async function handler(m, { sock }) {
  const pteroConfig = config.pterodactyl;

  const { server: serverVersion, serverKey } = parseServerVersion(m.command);
  const serverLabel = serverVersion.toUpperCase();

  if (!hasFullAccess(m.sender, serverVersion, m.isOwner)) {
    const userRole = getUserRole(m.sender, serverVersion);
    return m.reply(
      `❌ *se rechazó el acceso*

` +
        `No tienes acceso a *${serverLabel}*\n` +
        `> Tu rol: *${userRole || "No hay"}*`,
    );
  }

  const serverConfig = getServerConfig(pteroConfig, serverKey);
  const missingConfig = validateConfig(serverConfig);

  if (missingConfig.length > 0) {
    const available = getAvailableServers(pteroConfig);
    let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverLabel} SIN CONFIGURAR*\n\n`;
    if (available.length > 0) {
      txt += `> Servidor disponible: *${available.join(", ")}*\n`;
      txt += `> Ejemplo: \`${m.prefix}cadmin${available[0]} username\``;
    } else {
      txt += `> Contenido en la sección \`config.js\` \`pterodactyl.server1\``;
    }
    return m.reply(txt);
  }

  let targetUser = null;
  let username = null;
  const args = m.text?.trim() || "";

  if (args.includes(",")) {
    const parts = args.split(",");
    username = parts[0]?.trim().toLowerCase();
    let nomor = parts[1]?.trim().replace(/[^0-9]/g, "");
    if (nomor) targetUser = nomor + "@s.whatsapp.net";
  } else if (args) {
    username = args.trim().toLowerCase();
  }

  if (!username) {
    const available = getAvailableServers(pteroConfig);
    return m.reply(
      `⚠️ *MODO DE USO*\n\n` +
        `> \`${m.prefix}${m.command} username\`\n` +
        `> \`${m.prefix}${m.command} username,628xxx\`\n` +
        `> Reply/mention user\n\n` +
        `> Servidores disponibles: *${available.join(", ") || "none"}*`,
    );
  }

  if (!/^[a-z0-9_]{3,16}$/.test(username)) {
    return m.reply(
      `❌ El nombre de usuario sólo puede ser letras minúsculas, números, subrayar (3-16 caracteres).`,
    );
  }

  if (!targetUser) {
    if (m.quoted?.sender) {
      targetUser = cleanJid(m.quoted.sender);
    } else if (m.mentionedJid?.length > 0) {
      targetUser = cleanJid(m.mentionedJid[0]);
    } else {
      targetUser = cleanJid(m.sender);
    }
  }

  if (!targetUser) {
    return m.reply(`❌ Incapaz de determinar el número de destino.`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetUser.split("@")[0]);
    if (!onWa?.exists) {
      return m.reply(
        `❌ Número \`${targetUser.split("@")[0]}\` ¡No está registrado en WhatsApp!`,
      );
    }
  } catch (e) {}

  const email = `${username}@gmail.com`;
  const name = capitalize(username) + " Admin";
  const password = username + crypto.randomBytes(3).toString("hex");

  await m.reply(
    `🛠️ *CREANDO ADMINISTRADOR DEL PANEL...*

> Server: *${serverLabel}*\n> Username: \`${username}\`\n> Target: \`${targetUser.split("@")[0]}\``,
  );

  try {
    const userRes = await axios.post(
      `${serverConfig.domain}/api/application/users`,
      {
        email,
        username,
        first_name: name,
        last_name: "Admin",
        root_admin: true,
        language: "en",
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${serverConfig.apikey}`,
          "Content-Type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
      },
    );

    const user = userRes.data.attributes;

    let detailTxt = `✅ *admin panel fue creado con éxito*

`;
    detailTxt += `╭─「 📋 *DETALLES DE LA CUENTA* 」\n`;
    detailTxt += `┃ 🖥️ \`sᴇʀᴠᴇʀ\`: *${serverLabel}*\n`;
    detailTxt += `┃ 🆔 \`ᴜsᴇʀ ɪᴅ\`: *${user.id}*\n`;
    detailTxt += `┃ 👤 \`ᴜsᴇʀɴᴀᴍᴇ\`: *${user.username}*\n`;
    detailTxt += `┃ 🔐 \`ᴘᴀssᴡᴏʀᴅ\`: *${password}*\n`;
    detailTxt += `┃ 👑 \`sᴛᴀᴛᴜs\`: *Root Admin*\n`;
    detailTxt += `┃ 🗓️ \`FECHA\`: *${formatDate()}*\n`;
    detailTxt += `╰───────────────\n\n`;
    detailTxt += `🌐 *ʟᴏɢɪɴ ᴘᴀɴᴇʟ:* ${serverConfig.domain}\n\n`;
    detailTxt += `> ⚠️ ¡Esta cuenta tiene acceso completo!
`;
    detailTxt += `> ⚠️ ¡No lo compartas con nadie!`;

    await sock.sendMessage(targetUser, { text: detailTxt });

    if (targetUser !== m.sender) {
      await m.reply(
        `✅ *admin panel fue creado con éxito*

> Server: *${serverLabel}*
> Los datos se han enviado a \`${targetUser.split("@")[0]}\``,
      );
    }
  } catch (err) {
    return m.reply(te(m.prefix, m.command, m.pushName))
  }
}

export { pluginConfig as config, handler }
