import { getDatabase } from '../../src/lib/ourin-database.js'
import { hasAccessToServer, VALID_SERVERS } from '../../src/lib/ourin-roles-cpanel.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
const DEFAULT_JEDA = 5 * 60 * 1000;

const pluginConfig = {
  name: "cekjeda",
  alias: ["jedastatus", "statusjeda"],
  category: "panel",
  description: "Consulta el intervalo de creación de paneles",
  usage: ".cekjeda",
  example: ".cekjeda",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatTime(ms) {
  if (ms <= 0) return "0 segundos";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0)
    return `${hours} horas ${minutes % 60} minutos ${seconds % 60} segundos`;
  if (minutes > 0) return `${minutes} minutos ${seconds % 60} segundos`;
  return `${seconds} segundos`;
}

function handler(m, { sock }) {
  const hasAccess = VALID_SERVERS.some((server) =>
    hasAccessToServer(m.sender, server, m.isOwner),
  );

  if (!hasAccess && !m.isOwner) {
    return m.reply(`❌ *falló*

> ¡No tienes acceso al CPanel!`);
  }

  const db = getDatabase();
  const jedaMs = db.setting("panelCreateJeda") ?? DEFAULT_JEDA;
  const lastUsed = db.setting("panelCreateLastUsed") || 0;
  const now = Date.now();
  const elapsed = now - lastUsed;
  const remaining = Math.max(0, jedaMs - elapsed);

  let status = "✅ *READY*";
  let statusDesc = "¡Puedo crear un panel ahora!";

  if (jedaMs === 0) {
    status = "⚡ *SIN INTERVALO*";
    statusDesc = "¡La pausa está desactivada, libre de crear!";
  } else if (remaining > 0) {
    status = "🕕 *COOLDOWN*";
    statusDesc = `Espera ${formatTime(remaining)} de nuevo`;
  }

  let text = `⏱️ *ESTADO DEL INTERVALO DEL PANEL*

`;
  text += `╭┈┈⬡「 📊 *sᴛᴀᴛᴜs* 」\n`;
  text += `┃ ${status}\n`;
  text += `┃ ${statusDesc}\n`;
  text += `╰┈┈⬡\n\n`;

  text += `╭┈┈⬡「 ⚙️ *ᴋᴏɴꜰɪɢ* 」\n`;
  text += `┃ ◦ Intervalo: *${jedaMs === 0 ? "OFF" : formatTime(jedaMs)}*\n`;
  text += `┃ ◦ Por defecto: *5 minutos*
`;

  if (lastUsed > 0) {
    const lastUsedTime = timeHelper.fromTimestamp(lastUsed, "HH:mm:ss");
    text += `┃ ◦ Last create: *${lastUsedTime}*\n`;
  }

  if (remaining > 0) {
    text += `┃ ◦ Restante: *${formatTime(remaining)}*\n`;
  }

  text += `╰┈┈⬡\n\n`;

  if (m.isOwner) {
    text += `> _Propietario: uso \`${m.prefix}jedacreate\` para configuración_`;
  }

  return m.reply(text);
}

export { pluginConfig as config, handler }
