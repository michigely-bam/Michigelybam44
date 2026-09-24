import generateCustomTTS from "../../src/scraper/topmedia.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";
import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const execAsync = promisify(exec);

const pluginConfig = {
  name: "autoai",
  alias: ["aai"],
  category: "group",
  description:
    "Toggle auto IA respuesta para grupo con opciones de texto o voz",
  usage:
    ".autoai on/off --ourinmode=<character|custom> --logic=<custom instruction> --type=<text|voice>",
  example: ".autoai on --ourinmode=furina --type=voice",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const characters = {
  furina: {
    name: "Furina",
    instruction:
      "Usted es Furina de Genshin Impact, hablar de casual pero elegante, un poco dramático, a veces un poco orgulloso pero todavía cálido, no demasiado largo, responder directamente al núcleo como un chat regular, una vez en un tiempo, siempre se puede deshacerse del tema del escenario o del mar.",
  },
  zeta: {
    name: "Zeta",
    instruction:
      "Eres Zeta de Spy x Family. Hablas con seriedad y calma, aunque siempre sospechas que hay una conspiración. Responde de forma natural, breve y directa.",
  },
  kobo: {
    name: "Kobo Kanaeru",
    instruction:
      "Eres Koko Kanaeru, habla casual, sé un poco ruidoso, sólo un poco de charla, puedes ser un poco aleatorio o divertido, no lo superes con gorras o emojis, no digas que eres IA.",
  },
  elaina: {
    name: "Elaina",
    instruction:
      "Usted es Elaina, habla suavemente, calma, confianza, pequeño narcisismo sutil, rápido, limpio, y directo al núcleo como un chat normal.",
  },
  waguri: {
    name: "Waguri",
    instruction:
      "Eres un waguri, eres corto, tienes un poco de frío, pero en realidad te importa, un poco de malentendido, hasta el punto, como un chat regular.",
  },
  bell409: {
    name: "Bell409",
    instruction: config.autoaiPersonas?.Bell409 || "",
  },
};
async function convertToOggOpus(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, ".ogg");
  const cmd = `ffmpeg -y -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputPath}"`;

  try {
    await execAsync(cmd, { timeout: 60000 });
    if (fs.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (e) {
    console.log("[AutoAI] FFmpeg error:", e.message);
  }
  return null;
}

async function handler(m) {
  const db = getDatabase();
  const args = m.args || [];
  const fullArgs = m.fullArgs || "";

  if (!m.isGroup) {
    return m.reply(`❌ Esta característica es sólo para el grupo!`);
  }

  if (!m.isAdmin && !m.isOwner) {
    return m.reply(`❌ ¡Sólo el administrador puede usar esta característica!`);
  }

  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_personas) db.db.data.autoai_personas = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  const subcmd = args[0]?.toLowerCase();

  if (subcmd === "tambahpersona") {
    if (!m.isOwner)
      return m.reply(`❌ ¡Solo el propietario puede añadir personas!`);
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1])
      return m.reply(
        `❌ ¡Formato equivocado!

> .autoai tambahpersona <nombre>|<instrucción>

> Ejemplo: .autoai tambahpersona nexa|Eres Nexa AI...`,
      );
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName])
      return m.reply(
        `❌ El nombre "${pName}" ya lo usa una persona integrada.

> Seleccione un nombre diferente`,
      );
    db.db.data.autoai_personas[pName] = {
      name: personaArgs[0],
      instruction: pInstruction,
      createdBy: m.sender,
      createdAt: new Date().toISOString(),
    };
    db.save();
    return m.reply(
      `✅ *Persona añadida*

> Nombre: ${personaArgs[0]}\n> Clave: ${pName}\n> Instrucción: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}

> Utiliza: .autoai on --ourinmode=${pName}`,
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner)
      return m.reply(`❌ ¡Solo el propietario puede eliminar personas!`);
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey)
      return m.reply(
        `❌ ¡Formato equivocado!

> .autoai hapuspersona <nombre>

> Ejemplo: .autoai hapuspersona nexa`,
      );
    if (!db.db.data.autoai_personas[pKey])
      return m.reply(
        `❌ No se encontró la persona "${pKey}".

> Escribe .autoai listpersona para ver la lista`,
      );
    delete db.db.data.autoai_personas[pKey];
    db.save();
    return m.reply(`✅ Persona "${pKey}" eliminada correctamente`);
  }

  if (subcmd === "listpersona") {
    const builtIn = Object.entries(characters)
      .map(([k, v]) => `  ▸ ${k} - ${v.name}`)
      .join("\n");
    const customEntries = Object.entries(db.db.data.autoai_personas);
    const custom = customEntries.length
      ? customEntries
          .map(
            ([k, v]) =>
              `  ▸ ${k} - ${v.name} (${v.instruction.substring(0, 40)}${v.instruction.length > 40 ? "..." : ""})`,
          )
          .join("\n")
      : "  ▸ (sin personas personalizadas)";
    let txt = `🤖 *LISTA DE PERSONAS*

`;
    txt += `*Predeterminado:*
${builtIn}\n\n`;
    txt += `*Personalizadas:*\n${custom}\n\n`;
    txt += `*Global:* ${db.db.data.autoai_global.enabled ? "✅ Activo" : "❌ Inactivo"}\n\n`;
    txt += `> .autoai on --ourinmode=<key>\n`;
    txt += `> .autoai tambahpersona <nombre>|<instrucción>\n`;
    txt += `> .autoai hapuspersona <nombre>\n`;
    txt += `> .autoai global on/off`;
    return m.reply(txt);
  }

  if (subcmd === "global") {
    if (!m.isOwner) return m.reply(`❌ ¡Solo el propietario puede configurar el modo global!`);
    const globalMode = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalMode))
      return m.reply(
        `❌ ¡Formato equivocado!

> .autoai global on/off

> Estado global: ${db.db.data.autoai_global.enabled ? "✅ Activo" : "❌ Inactivo"}`,
      );
    if (globalMode === "on") {
      const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
      const typeMatch = fullArgs.match(/--type=(text|voice)/i);
      const logicMatch = fullArgs.match(
        /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic)|$)/i,
      );
      const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
      const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
      const customLogic = logicMatch ? logicMatch[1].trim() : null;

      let instruction = "";
      let characterName = "Global";
      let character = "global";

      if (charKey === "custom" && customLogic) {
        instruction = customLogic;
        character = "custom";
        characterName = "Custom";
      } else if (charKey && characters[charKey]) {
        instruction = characters[charKey].instruction;
        character = charKey;
        characterName = characters[charKey].name;
      } else if (charKey && db.db.data.autoai_personas[charKey]) {
        instruction = db.db.data.autoai_personas[charKey].instruction;
        character = charKey;
        characterName = db.db.data.autoai_personas[charKey].name;
      } else if (!charKey) {
        const existingGlobal = db.db.data.autoai_global;
        if (existingGlobal.instruction) {
          instruction = existingGlobal.instruction;
          character = existingGlobal.character || "global";
          characterName = existingGlobal.characterName || "Global";
        } else {
          return m.reply(
            `❌ Todavía no hay una persona global configurada.

> .autoai global on --ourinmode=furina
> .autoai global on --ourinmode=custom --logic=...`,
          );
        }
      } else {
        const charList = [
          ...Object.keys(characters),
          ...Object.keys(db.db.data.autoai_personas),
          "custom",
        ].join(", ");
        return m.reply(`❌ ¡Personaje no válido!

> Disponible: ${charList}`);
      }

      db.db.data.autoai_global = {
        enabled: true,
        character,
        characterName,
        instruction,
        responseType,
      };
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ACTIVADO*\n\n` +
          `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
          `┃ 🎭 Personaje: *${characterName}*\n` +
          `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `ℹ️ AutoAI está activo en todos los grupos
` +
          `> ℹ️ Los grupos con configuración propia seguirán usándola.
` +
          `> ℹ️ Escribe *.autoai global off* para desactivarlo.`,
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      return m.reply(
        `🌐 *AUTOAI GLOBAL DESACTIVADO*

> AutoAI solo seguirá activo en los grupos que tengan configuración propia.`,
      );
    }
  }

  const mode = subcmd;
  const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
  const typeMatch = fullArgs.match(/--type=(text|voice)/i);
  const logicMatch = fullArgs.match(
    /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic)|$)/i,
  );
  const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
  const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
  const customLogic = logicMatch ? logicMatch[1].trim() : null;

  if (!mode || !["on", "off"].includes(mode)) {
    const charList = Object.entries(characters)
      .map(([key, val]) => `> ${key} - ${val.name}`)
      .join("\n");
    const customP = Object.entries(db.db.data.autoai_personas);
    const customList = customP.length
      ? customP.map(([k, v]) => `> ${k} - ${v.name} (custom)`).join("\n")
      : "";
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ*\n\n`;
    txt += `> Activa o desactiva las respuestas automáticas de la IA

`;
    txt += `*Uso:*
`;
    txt += `> .autoai on --ourinmode=<personaje|custom> --type=<text|voice>
`;
    txt += `> .autoai off\n`;
    txt += `> .autoai tambahpersona <nombre>|<instrucción>\n`;
    txt += `> .autoai hapuspersona <nombre>\n`;
    txt += `> .autoai listpersona\n`;
    txt += `> .autoai global on/off\n\n`;
    txt += `*Personaje predeterminado:*
${charList}\n`;
    if (customList) txt += `
*Personaje personalizado:*
${customList}\n`;
    txt += `\n*Global:* ${db.db.data.autoai_global.enabled ? "✅ Activo" : "❌ Inactivo"}\n\n`;
    txt += `*Tipo de respuesta:*\n`;
    txt += `> text - Responder con texto
`;
    txt += `> voice - Responder con una nota de voz (TTS)

`;
    txt += `*Ejemplo:*
`;
    txt += `> .autoai on --ourinmode=furina --type=text\n`;
    txt += `> .autoai on --ourinmode=custom --logic=eres Nexa AI
`;
    txt += `> .autoai tambahpersona nexa|Eres Nexa AI...
`;
    txt += `> .autoai global on --ourinmode=furina`;
    return m.reply(txt);
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    const globalStatus = db.db.data.autoai_global?.enabled
      ? `

ℹ️ Global sigue activo, pero este grupo se ha optado por salir.
> ℹ️ Escriba *.autoai global off* para apagar global`
      : "";
    return m.reply(
      `🤖 *AUTO IA DESACTIVADA*

> La IA automática se desactivó para este grupo
> Todos los comandos vuelven a${globalStatus}`,
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ ¡Personaje no válido!

> Personajes disponibles: ${charList}

> Ejemplo: .autoai on --ourinmode=furina --type=voice
> Personalizado: .autoai on --ourinmode=custom --logic=eres Nexa AI`,
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `❌ ¡El modo personalizado requiere --logic!

> Ejemplo: .autoai on --ourinmode=custom --logic=eres Nexa AI, ...`,
      );
    }
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: "custom",
      characterName: "Custom",
      instruction: customLogic,
      responseType: responseType,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ACTIVADO*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Personaje personalizado*
`;
    txt += `┃ 🧠 Instrucción: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n`;
    txt += `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n`;
    txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Los comandos no apropiados para el personaje están desactivados.\n`;
    txt += `> ℹ️ El bot responde cuando lo citan o etiquetan.\n`;
    txt +=
      responseType === "voice" ? `> ℹ*Respuesta en nota de voz*
` : "";
    txt += `> ℹ️ Escribe *.autoai off* para desactivarlo.`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  const customPersona = db.db.data.autoai_personas[charKey];
  if (customPersona) {
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: charKey,
      characterName: customPersona.name,
      instruction: customPersona.instruction,
      responseType: responseType,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ACTIVADO*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Personaje: *${customPersona.name}* (personalizado)\n`;
    txt += `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n`;
    txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Los comandos no apropiados para el personaje están desactivados.\n`;
    txt += `> ℹ️ El bot responde cuando lo citan o etiquetan.\n`;
    txt +=
      responseType === "voice" ? `> ℹ*Respuesta en nota de voz*
` : "";
    txt += `> ℹ️ Escribe *.autoai off* para desactivarlo.`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ ¡Personaje no válido!

> Personajes disponibles: ${charList}\n\n> Ejemplo: .autoai on --ourinmode=furina --type=voice`,
    );
  }

  db.db.data.autoai[m.chat] = {
    enabled: true,
    character: charKey,
    characterName: characters[charKey].name,
    instruction: characters[charKey].instruction,
    responseType: responseType,
    sessions: {},
    activatedBy: m.sender,
    activatedAt: new Date().toISOString(),
  };
  db.save();

  let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ACTIVADO*\n\n`;
  txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
  txt += `┃ 🎭 Personaje: *${characters[charKey].name}*\n`;
  txt += `┃ 📢 Respuesta: *${responseType === "voice" ? "🎤 Nota de voz" : "💬 Texto"}*\n`;
  txt += `┃ 👤 Activado por: @${m.sender.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> ℹ️ Los comandos no apropiados para el personaje están desactivados.\n`;
  txt += `> ℹ️ El bot responde cuando lo citan o etiquetan.\n`;
  txt +=
    responseType === "voice" ? `> ℹ*Respuesta en nota de voz*
` : "";
  txt += `> ℹ️ Escribe *.autoai off* para desactivarlo.`;

  await m.reply(txt, { mentions: [m.sender] });
}

async function generateVoiceResponse(text, sock, chatId, quotedMsg) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    const audioUrl = await generateCustomTTS(null, text);

    const audioRes = await axios.get(audioUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const mp3Path = path.join(tempDir, `tts_${Date.now()}.mp3`);
    fs.writeFileSync(mp3Path, Buffer.from(audioRes.data));

    const oggPath = await convertToOggOpus(mp3Path);

    if (oggPath && fs.existsSync(oggPath)) {
      const audioBuffer = fs.readFileSync(oggPath);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
        },
        { quoted: quotedMsg },
      );

      fs.unlinkSync(mp3Path);
      fs.unlinkSync(oggPath);

      return true;
    } else {
      const audioBuffer = fs.readFileSync(mp3Path);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: quotedMsg },
      );

      fs.unlinkSync(mp3Path);

      return true;
    }
  } catch (e) {
    console.log("[AutoAI Voice] Error:", e.message);
    return false;
  }
}

export { pluginConfig as config, handler, characters, generateVoiceResponse };
