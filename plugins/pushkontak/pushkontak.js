import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import {
  resolveAnyLidToJid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "pushkontak",
  alias: ["puskontak", "push"],
  category: "pushkontak",
  description: "Empuje el mensaje a todos los grupos miembros + ahorro de auto contacto a VCF",
  usage: ".pushkontak <mensaje>",
  example: ".pushkontak ¡Hola a todos!",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function createSerial(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let r = "";
  for (let i = 0; i < len; i++)
    r += chars.charAt(Math.floor(Math.random() * chars.length));
  return r;
}

function buildVcf(contacts) {
  return contacts
    .map((jid) => {
      const num = jid.split("@")[0];
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:WA[${createSerial(2)}] ${num}`,
        `TEL;type=CELL;type=VOICE;waid=${num}:+${num}`,
        "END:VCARD",
        "",
      ].join("\n");
    })
    .join("");
}

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

  const text = m.text?.trim();
  if (!text) {
    return m.reply(
      `📢 *ENVÍO A CONTACTOS*

> Introduzca el mensaje que desea enviar

\`Ejemplo: ${m.prefix}pushkontak ¡Hola a todos!\``,
    );
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
      `📢 *ENVÍO A CONTACTOS*

` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 mensaje: \`${text.substring(0, 50)}${text.length > 50 ? "..." : ""}\`\n` +
        `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${participants.length}\` member\n` +
        `┃ ⏱️ INTERVALO: \`${jedaPush}ms\`\n` +
        `┃ 📊 ESTIMACIÓN: \`${Math.ceil((participants.length * jedaPush) / 60000)} minutos\`
` +
        `┃ 💾 GUARDADO AUTOMÁTICO: \`Activo (VCF)\`\n` +
        `╰┈┈⬡\n\n` +
        `> Iniciando el envío masivo...`,
    );

    global.statuspush = true;
    let successCount = 0;
    let failedCount = 0;
    const savedContacts = [];

    for (const member of participants) {
      if (global.stoppush) {
        delete global.stoppush;
        delete global.statuspush;

        await m.reply(
          `⏹️ *ᴘᴜsʜ DETENIDO*\n\n` +
            `> ✅ Correcto: \`${successCount}\`\n` +
            `> ❌ Falló: \`${failedCount}\`\n` +
            `> ⏸️ Restante: \`${participants.length - successCount - failedCount}\``,
        );

        if (savedContacts.length > 0) {
          await sendVcfToOwner(sock, m.sender, savedContacts, metadata.subject);
        }
        return;
      }

      try {
        const kodeUnik = createSerial(6);
        const pesan = `${text}\n\n#${kodeUnik}`;

        await sock.sendMessage(member, { text: pesan });
        savedContacts.push(member);
        successCount++;
      } catch (err) {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaPush));
    }

    delete global.statuspush;

    if (savedContacts.length > 0) {
      await sendVcfToOwner(sock, m.sender, savedContacts, metadata.subject);
    }

    m.react("✅");
    await m.reply(
      `✅ *push terminado*

` +
        `╭┈┈⬡「 📊 *RESULTADO* 」\n` +
        `┃ ✅ correcto: \`${successCount}\`\n` +
        `┃ ❌ ERROR: \`${failedCount}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${participants.length}\`\n` +
        `┃ 💾 CONTACTOS: \`${savedContacts.length} guardados\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    delete global.statuspush;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function sendVcfToOwner(sock, ownerJid, contacts, groupName) {
  try {
    const vcfDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(vcfDir)) fs.mkdirSync(vcfDir, { recursive: true });

    const vcfPath = path.join(vcfDir, `pushkontak_${Date.now()}.vcf`);
    const vcfContent = buildVcf(contacts);
    fs.writeFileSync(vcfPath, vcfContent, "utf8");

    await sock.sendMessage(ownerJid, {
      document: fs.readFileSync(vcfPath),
      fileName: `Contactos_${groupName || "Group"}_${contacts.length}.vcf`,
      mimetype: "text/vcard",
      caption: `💾 *GUARDADO AUTOMÁTICO DE CONTACTOS*

> Total: \`${contacts.length}\` contactos
> Grupo: \`${groupName || "Desconocido"}\`

> _Importe este archivo a su HP para guardar todos los contactos._`,
    });

    try {
      fs.unlinkSync(vcfPath);
    } catch {}
  } catch (e) {}
}

export { pluginConfig as config, handler };
