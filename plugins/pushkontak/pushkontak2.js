import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import {
  resolveAnyLidToJid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "pushkontak2",
  alias: ["puskontak2", "push2"],
  category: "pushkontak",
  description: "Empuje el mensaje con un nombre de contacto a todos los miembros del grupo",
  usage: '.pushkontak2 <mensaje>|<nombre_contacto>',
  example: '.pushkontak2 ¡Hola!|TiendaNueva',
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const groupMode = getGroupMode(m.chat, db);

  if (groupMode !== "pushkontak" && groupMode !== "all") {
    return m.reply(
      `❌ *modo no es adecuado*

> Activar el modo Pushcontack primero

\`${m.prefix}botmode pushkontak\``,
    );
  }

  const input = m.text?.trim();
  if (!input || !input.includes("|")) {
    return m.reply(
      `📢 *ENVÍO A CONTACTOS 2*

> Formato: mensaje | nombre del contacto

\`Ejemplo: ${m.prefix}pushkontak2 ¡Hola a todos!|TiendaNueva\``,
    );
  }

  const [text, namaKontak] = input.split("|").map((s) => s.trim());

  if (!text || !namaKontak) {
    return m.reply(`❌ *falló*

> Formato inválido. Usa: mensaje | nombre del contacto`);
  }

  if (global.statuspush) {
    return m.reply(
      `❌ *falló*

> El contacto está funcionando. Tipo \`${m.prefix}stoppush\` Parar.`,
    );
  }

  m.react("📢");

  try {
    const metadata = m.groupMetadata;
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const participants = metadata.participants
      .map((p) => {
        if (p.phoneNumber) return p.phoneNumber;
        if (p.jid && !p.jid.endsWith("@lid")) return p.jid;
        if (p.id && !p.id.endsWith("@lid")) return p.id;
        const resolved = resolveAnyLidToJid(
          p.jid || p.id,
          metadata.participants,
        );
        if (resolved && !resolved.endsWith("@lid") && !isLidConverted(resolved))
          return resolved;
        const cached = getCachedJid(p.jid || p.id || p.lid || "");
        if (cached && !cached.endsWith("@lid") && !isLidConverted(cached))
          return cached;
        return null;
      })
      .filter((id) => id && id !== botId && !id.includes(m.sender));

    if (participants.length === 0) {
      m.react("❌");
      return m.reply(`❌ *falló*

> Ningún miembro puede ser enviado`);
    }

    const jedaPush = db.setting("jedaPush") || 5000;

    await m.reply(
      `📢 *ENVÍO A CONTACTOS 2*

` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 mensaje: \`${text.substring(0, 50)}${text.length > 50 ? "..." : ""}\`\n` +
        `┃ 👤 NOMBRE: \`${namaKontak}\`\n` +
        `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${participants.length}\` member\n` +
        `┃ ⏱️ INTERVALO: \`${jedaPush}ms\`\n` +
        `╰┈┈⬡\n\n` +
        `> Empieza a empujar con el contacto...`,
    );

    global.statuspush = true;
    let successCount = 0;
    let failedCount = 0;

    function randomKode(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    for (const member of participants) {
      if (global.stoppush) {
        delete global.stoppush;
        delete global.statuspush;

        await m.reply(
          `⏹️ *ᴘᴜsʜ DETENIDO*\n\n` +
            `> ✅ Correcto: \`${successCount}\`\n` +
            `> ❌ Falló: \`${failedCount}\``,
        );
        return;
      }

      try {
        const memberNumber = member.split("@")[0];
        const kodeUnik = randomKode(6);
        const pesan = `${text}\n\n#${kodeUnik}`;

        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${namaKontak} - ${memberNumber}
TEL;type=CELL;type=VOICE;waid=${memberNumber}:+${memberNumber}
END:VCARD`;

        await sock.sendMessage(member, { text: pesan });

        await sock.sendMessage(member, {
          contacts: {
            displayName: namaKontak,
            contacts: [
              {
                displayName: namaKontak,
                vcard: vcard,
              },
            ],
          },
        });

        successCount++;
      } catch (err) {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaPush));
    }

    delete global.statuspush;

    m.react("✅");
    await m.reply(
      `✅ *push terminado*

` +
        `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
        `┃ ✅ correcto: \`${successCount}\`\n` +
        `┃ ❌ ERROR: \`${failedCount}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${participants.length}\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    delete global.statuspush;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
