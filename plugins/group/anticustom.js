import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "anticustom",
  alias: ["antiaddcustom", "customanti"],
  category: "group",
  description: "Hacer AntiCustom a través de una sesión de preguntas y respuestas por paso",
  usage: ".anticustom <on/off/list/add/del/metode/cancel>",
  example: ".anticustom",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

if (!global.anticustomSessions) global.anticustomSessions = new Map();

const SESSION_TIMEOUT = 10 * 60 * 1000;

function normalizeRules(rules) {
  return Array.isArray(rules)
    ? rules.filter((rule) => rule && rule.pattern)
    : [];
}

function formatRule(rule, index) {
  const type = rule.type === "regex" ? "regex" : "contains";
  const action = rule.action || "remove";
  const title = rule.groupName || rule.name || "-";
  return `${index + 1}. *${title}*\n> pattern: \`${rule.pattern}\`\n> type: *${type}*\n> action: *${action}*`;
}

function getSessionKey(m) {
  return `${m.chat}:${m.sender}`;
}

function clearSession(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (session?.timeout) clearTimeout(session.timeout);
  global.anticustomSessions.delete(sessionKey);
}

function refreshSessionTimeout(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return;
  if (session.timeout) clearTimeout(session.timeout);
  session.timeout = setTimeout(() => {
    const current = global.anticustomSessions.get(sessionKey);
    if (current?.startedAt === session.startedAt) {
      global.anticustomSessions.delete(sessionKey);
    }
  }, SESSION_TIMEOUT);
}

function normalizeAction(action, fallback = "remove") {
  const value = String(action || fallback).toLowerCase();
  if (["kick", "remove", "delete", "hapus"].includes(value)) {
    return value === "delete" || value === "hapus" ? "remove" : value;
  }
  return fallback;
}

function formatAction(action) {
  return action === "kick" ? "kick member" : "Borrar el mensaje";
}

function parsePatternAnswer(text) {
  const raw = String(text || "").trim();
  if (!raw) return { error: "La respuesta sigue vacía." };

  if (/^regex\s*:/i.test(raw)) {
    const pattern = raw.replace(/^regex\s*:/i, "").trim();
    if (!pattern) return { error: "Regex está vacío. `regex:` ya." };
    try {
      new RegExp(pattern, "i");
    } catch {
      return { error: "Regex inválido. Revise el patrón de nuevo." };
    }
    return {
      type: "regex",
      patterns: [pattern],
    };
  }

  const cleaned = raw.replace(/^contains\s*:/i, "").trim();
  const patterns = [
    ...new Set(
      cleaned
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  if (patterns.length === 0) {
    return { error: "Aún no tengo ni una palabra para ello." };
  }

  return {
    type: "contains",
    patterns,
  };
}

function buildSummary(session) {
  return (
    `> Título: *${session.title}*\n` +
    `> Tipo de detección: *${session.type}*\n` +
    `> Pattern: ${session.patterns.map((item) => `\`${item}\``).join(", ")}\n` +
    `> Action: *${formatAction(session.action)}*`
  );
}

async function sendPrompt(sock, m, text) {
  const sent = await sock.sendMessage(m.chat, { text }, { quoted: m });
  return sent?.key?.id || null;
}

async function startWizard(m, sock, mode, isFirstSetup = false) {
  const sessionKey = getSessionKey(m);
  const existing = global.anticustomSessions.get(sessionKey);

  if (existing) {
    await m.reply(
      `⚠️ Todavía tienes una sesión de AntiCustom que no ha terminado.

` +
        `> Responde a la última pregunta del bot para continuar
` +
        `> O cancelar con \`${m.prefix}anticustom cancel\``,
    );
    return;
  }

  const session = {
    chat: m.chat,
    sender: m.sender,
    step: "title",
    title: "",
    type: "contains",
    patterns: [],
    action: normalizeAction(mode, "remove"),
    promptId: null,
    startedAt: Date.now(),
    timeout: null,
  };

  global.anticustomSessions.set(sessionKey, session);
  refreshSessionTimeout(sessionKey);

  const intro = isFirstSetup
    ? `🛡️ *Bienvenido a la configuración de AntiCustom*

` +
      `Voy a ayudar a hacer AntiCustom por sesión, paso a paso.

` +
      `*Funcionamiento:*
` +
      `1. Determine el título de la regla
` +
      `2. Contenido de palabras o patrones que se quieren detectar
` +
      `3. Elige la acción que se ejecutará al detectarlo
` +
      `4. Confirma los detalles finales

`
    : `🛡️ *Agreguemos una nueva regla de AntiCutom*

`;

  session.promptId = await sendPrompt(
    sock,
    m,
    intro +
      `*Pregunta 1/4*
` +
      `¿Cuál es el título?

` +
      `Responda a este mensaje con el título de la regla que quieras.
` +
      `> Ejemplo: \`Antipalabras ofensivas\``,
  );
}

function buildGuideMessage(m, status, mode, rules) {
  return (
    `🛡️ *ᴀɴᴛɪᴄᴜsᴛᴏᴍ*\n\n` +
    `> Status: *${status.toUpperCase()}*\n` +
    `> Mode default: *${normalizeAction(mode).toUpperCase()}*\n` +
    `> Total rule: *${rules.length}*\n\n` +
    `Si quieres añadir más AntiCustom:
` +
    `> \`${m.prefix}anticustom add\`\n\n` +
    `Si quieres ajustar el estado:
` +
    `> \`${m.prefix}anticustom on\`\n` +
    `> \`${m.prefix}anticustom off\`\n\n` +
    `Si quieres ver o eliminar las reglas:
` +
    `> \`${m.prefix}anticustom list\`\n` +
    `> \`${m.prefix}anticustom del <título>\`\n\n` +
    `Si quieres cambiar el modo predeterminado:
` +
    `> \`${m.prefix}anticustom método kick\`
` +
    `> \`${m.prefix}anticustom método remove\``
  );
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const rules = normalizeRules(groupData.anticustomRules);
  const mode = groupData.anticustomMode || "remove";
  const status = groupData.anticustom || "off";
  const sessionKey = getSessionKey(m);

  if (!sub) {
    if (rules.length === 0) {
      await startWizard(m, sock, mode, true);
      return;
    }

    await m.reply(buildGuideMessage(m, status, mode, rules));
    return;
  }

  if (sub === "add" || sub === "baru" || sub === "new" || sub === "buat") {
    await startWizard(m, sock, mode);
    return;
  }

  if (sub === "cancel" || sub === "batal") {
    if (!global.anticustomSessions.has(sessionKey)) {
      await m.reply("⚠️ No hay sesión de AntiCustom funcionando.");
      return;
    }
    clearSession(sessionKey);
    await m.reply("✅ La sesión AntiCustom fue cancelada.");
    return;
  }

  if (sub === "on") {
    db.setGroup(m.chat, { anticustom: "on" });
    await m.reply("✅ *AntiCustom activado*");
    return;
  }

  if (sub === "off") {
    db.setGroup(m.chat, { anticustom: "off" });
    await m.reply("❌ *AntiCustom ha sido desactivado*");
    return;
  }

  if (sub === "metode") {
    const action = normalizeAction(args[1], "");
    if (!action) {
      await m.reply(
        "❌ `.anticustom método kick` o `.anticustom método remove`",
      );
      return;
    }
    db.setGroup(m.chat, { anticustom: "on", anticustomMode: action });
    await m.reply(
      `✅ *Modo por defecto AntiCustom ahora ${action.toUpperCase()}*`,
    );
    return;
  }

  if (sub === "list") {
    if (rules.length === 0) {
      await m.reply("📋 No hay ninguna regla de AntiCumpt en este grupo.");
      return;
    }
    await m.reply(
      `📋 *ʟɪsᴛ ᴀɴᴛɪᴄᴜsᴛᴏᴍ*\n\n${rules.map(formatRule).join("\n\n")}`,
    );
    return;
  }

  if (sub === "del" || sub === "delete" || sub === "remove") {
    const name = args.slice(1).join(" ").trim().toLowerCase();
    if (!name) {
      await m.reply("❌ Formato: `.anticustom del <título>`");
      return;
    }

    const nextRules = rules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === name ||
        groupName === name ||
        ruleName.startsWith(`${name} #`)
      );
    });

    if (nextRules.length === rules.length) {
      await m.reply(`❌ Regla con título \`${name}\` No se encuentra.`);
      return;
    }

    db.setGroup(m.chat, { anticustomRules: nextRules });
    await m.reply(`✅ Regla con título \`${name}\` borrado con éxito.`);
    return;
  }

  await m.reply(
    "❌ Subcomando inválido. Uso: en, apagado, lista, añadir, del, método, cancelar",
  );
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;
  if (m.isCommand) return false;

  const sessionKey = getSessionKey(m);
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return false;
  if (session.chat !== m.chat || session.sender !== m.sender) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId || quotedId !== session.promptId) return false;

  const text = String(m.body || "").trim();
  if (!text) return false;

  refreshSessionTimeout(sessionKey);

  if (session.step === "title") {
    if (text.length < 2 || text.length > 40) {
      await m.reply("❌ El título debe ser de 2 a 40 caracteres sí.");
      return true;
    }

    session.title = text;
    session.step = "patterns";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡️ *Pregunta 2/4*

` +
        `Bien, el título es *${session.title}*.\n\n` +
        `Ahora, dame las palabras que quiera que detecte.

` +
        `Puedes elegir uno de los formatos:
` +
        `> *Contains*: envíe una palabra separada de una coma o una nueva línea
` +
        `> *Regex*: comienza la respuesta con \`regex:\`

` +
        `Ejemplo contains:\n` +
        `> \`anjing, goblok, tolol\`\n\n` +
        `Ejemplo regex:\n` +
        `> \`regex: (anj|anjing|a+n+j+)\`\n\n` +
        `Responder a este mensaje con su respuesta.`,
    );
    return true;
  }

  if (session.step === "patterns") {
    const parsed = parsePatternAnswer(text);
    if (parsed.error) {
      await m.reply(`❌ ${parsed.error}`);
      return true;
    }

    session.type = parsed.type;
    session.patterns = parsed.patterns;
    session.step = "action";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡️ *Pregunta 3/4*

` +
        `Eso significa que quieres esto:
` +
        `${session.patterns.map((item, index) => `${index + 1}. \`${item}\``).join("\n")}\n\n` +
        `> Tipo de detección: *${session.type}*\n\n` +
        `Si el mensaje de un miembro contiene esas palabras, ¿quieres *eliminarlo* o *expulsar* directamente al miembro?

` +
        `*Responde con:* \`hapus\` para eliminar el mensaje o \`kick\` para expulsar al miembro.`,
    );
    return true;
  }

  if (session.step === "action") {
    const action = normalizeAction(text, "");
    if (!action) {
      await m.reply("❌ Responde con `hapus` o `kick`.");
      return true;
    }

    session.action = action;
    session.step = "confirm";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡️ *Pregunta 4/4*

` +
        `Está bien, esto es el detalle que quieres:

` +
        `${buildSummary(session)}\n\n` +
        `¿Es correcto?

` +
        `*Responde con:* \`ya\` para guardar o \`batal\` para cancelar.`,
    );
    return true;
  }

  if (session.step === "confirm") {
    if (/^(batal|cancel|tidak|nggak|ga|gak|no)$/i.test(text)) {
      clearSession(sessionKey);
      await m.reply(
        "✅ Bien, la sesión AntiCutom se cancela. Si quieres empezar de nuevo, escribe `.anticustom add`.",
      );
      return true;
    }

    if (!/^(ya|iya|y|yes|oke|ok|setuju|gas|lanjut|sip|siap)$/i.test(text)) {
      await m.reply(
        "❌ Responde con `ya` para guardar o `batal` para cancelar.",
      );
      return true;
    }

    const db = getDatabase();
    const groupData = db.getGroup(m.chat) || {};
    const currentRules = normalizeRules(groupData.anticustomRules);
    const titleKey = session.title.toLowerCase();
    const filteredRules = currentRules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === titleKey ||
        groupName === titleKey ||
        ruleName.startsWith(`${titleKey} #`)
      );
    });

    const createdAt = new Date().toISOString();
    const generatedRules = session.patterns.map((pattern, index) => ({
      name:
        session.patterns.length === 1
          ? session.title
          : `${session.title} #${index + 1}`,
      groupName: session.title,
      pattern,
      type: session.type,
      action: session.action,
      flags: "i",
      createdAt,
    }));

    db.setGroup(m.chat, {
      anticustom: "on",
      anticustomMode: session.action,
      anticustomRules: [...filteredRules, ...generatedRules],
    });

    clearSession(sessionKey);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *AntiCustom fue creado con éxito*

` +
          `${buildSummary(session)}\n\n` +
          `> Estado automático: *ACTIVADO*
` +
          `> Total de reglas nuevas: *${generatedRules.length}*\n\n` +
          `Si quieres ver más guías, escribe \`${m.prefix}anticustom\``,
      },
      { quoted: m },
    );
    return true;
  }

  return false;
}

export { pluginConfig as config, handler, replyHandler };
