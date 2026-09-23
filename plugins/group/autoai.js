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
      "Eres Zeta de la familia Spy X, hablas en serio y tranquilo, pero siempre eres un poco sospechoso de besar una conspiración, mantenerse natural como un normal, corto, directo al grano.",
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
      return m.reply(`❌ ¡Sólo un propietario puede añadir persona!`);
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1])
      return m.reply(
        `❌ ¡Formato equivocado!

> .autoai add persona name # 124; instruction

> Contoh: .autoai Plus persona nexa xa 124; usted es nexa ai,...`,
      );
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName])
      return m.reply(
        `❌ Nama "${pName}" ¡Ha sido utilizado por una persona incorporada!

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
      `✅ *Persona ditambahkan*\n\n> Nama: ${personaArgs[0]}\n> Key: ${pName}\n> Logic: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}\n\n> Gunakan: .autoai on --ourinmode=${pName}`,
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner)
      return m.reply(`❌ ¡Sólo el propietario puede quitar la persona!`);
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey)
      return m.reply(
        `❌ ¡Formato equivocado!

> .autoai Eliminar persona

> Contoh: .autoai hapuspersona nexa`,
      );
    if (!db.db.data.autoai_personas[pKey])
      return m.reply(
        `❌ Persona "${pKey}" ¡No lo encontraron!

> Ketik .autoai listpersona para ver la lista`,
      );
    delete db.db.data.autoai_personas[pKey];
    db.save();
    return m.reply(`✅ Persona "${pKey}" suprimida con éxito`);
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
      : "  ▸ (no personal personalizado)";
    let txt = `🤖 *ᴅᴀғᴛᴀʀ ᴘᴇʀsᴏɴᴀ*\n\n`;
    txt += `*Bawaan:*\n${builtIn}\n\n`;
    txt += `*Custom:*\n${custom}\n\n`;
    txt += `*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}\n\n`;
    txt += `> .autoai on --ourinmode=<key>\n`;
    txt += `> .autoai añadir un nombre de persona
`;
    txt += `> .autoai Eliminar nombre de persona
`;
    txt += `> .autoai global on/off`;
    return m.reply(txt);
  }

  if (subcmd === "global") {
    if (!m.isOwner) return m.reply(`❌ ¡Sólo el propietario puede regatear a nivel mundial!`);
    const globalMode = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalMode))
      return m.reply(
        `❌ ¡Formato equivocado!

> .autoai global on/off

> Current Global: ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}`,
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
            `❌ ¡Todavía no hay nadie global!

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
        return m.reply(`❌ ¡Caracterismo inválido!

> Tersedia: ${charList}`);
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
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n` +
          `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
          `┃ 🎭 Karakter: *${characterName}*\n` +
          `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> ℹ️ AutoAI aktif di seluruh grup\n` +
          `> ℹ️ Grup yang sudah punya config tetap pakai config sendiri\n` +
          `> ℹ️ Ketik *.autoai global off* untuk menonaktifkan`,
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*

> AutoIA sólo está activo en grupos de configuración`,
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
    txt += `> Mengaktifkan/menonaktifkan auto AI response\n\n`;
    txt += `*Penggunaan:*\n`;
    txt += `> .autoai on --ourinmode=<karakter|custom> --type=<text|voice>\n`;
    txt += `> .autoai off\n`;
    txt += `> .autoai añadir un nombre de persona
`;
    txt += `> .autoai Eliminar nombre de persona
`;
    txt += `> .autoai listpersona\n`;
    txt += `> .autoai global on/off\n\n`;
    txt += `*Karakter bawaan:*\n${charList}\n`;
    if (customList) txt += `\n*Karakter custom:*\n${customList}\n`;
    txt += `\n*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}\n\n`;
    txt += `*Response Type:*\n`;
    txt += `> texto - Responder con texto regular
`;
    txt += `> voz - Responder con nota de voz (TTS)

`;
    txt += `*Contoh:*\n`;
    txt += `> .autoai on --ourinmode=furina --type=text\n`;
    txt += `> .autoai on --ourinmode=custom --logic=kamu adalah nexa ai\n`;
    txt += `> .autoai add persona nexa xa 124; usted es nexa ai
`;
    txt += `> .autoai global on --ourinmode=furina`;
    return m.reply(txt);
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    const globalStatus = db.db.data.autoai_global?.enabled
      ? `\n\n> ℹ️ Global masih aktif, tapi grup ini opted-out\n> ℹ️ Ketik *.autoai global off* untuk matikan global`
      : "";
    return m.reply(
      `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*

> Auto IA para este grupo ha sido deshabilitado
> Todo el comando está de nuevo en${globalStatus}`,
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ ¡Caracterismo inválido!

> Personajes disponibles: ${charList}\n\n> Contoh: .autoai on --ourinmode=furina --type=voice\n> Custom: .autoai on --ourinmode=custom --logic=kamu adalah nexa ai`,
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `❌ Mode custom membutuhkan --logic!\n\n> Contoh: .autoai on --ourinmode=custom --logic=kamu adalah nexa ai, ...`,
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
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Karakter: *Custom*\n`;
    txt += `┃ 🧠 Logic: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤 Diaktifkan: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹTodos los comandos (propietario inapropiado) están deshabilitados
`;
    txt += `> ℹ️ Bot respond ketika di-reply atau di-tag\n`;
    txt +=
      responseType === "voice" ? `> ℹ*Respuesta en nota de voz*
` : "";
    txt += `> ℹ️ Ketik *.autoai off* a la inhabilitación`;
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
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Karakter: *${customPersona.name}* (custom)\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤 Diaktifkan: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹTodos los comandos (propietario inapropiado) están deshabilitados
`;
    txt += `> ℹ️ Bot respond ketika di-reply atau di-tag\n`;
    txt +=
      responseType === "voice" ? `> ℹ*Respuesta en nota de voz*
` : "";
    txt += `> ℹ️ Ketik *.autoai off* a la inhabilitación`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ ¡Caracterismo inválido!

> Personajes disponibles: ${charList}\n\n> Contoh: .autoai on --ourinmode=furina --type=voice`,
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

  let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
  txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
  txt += `┃ 🎭 Karakter: *${characters[charKey].name}*\n`;
  txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
  txt += `┃ 👤 Diaktifkan: @${m.sender.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> ℹTodos los comandos (propietario inapropiado) están deshabilitados
`;
  txt += `> ℹ️ Bot respond ketika di-reply atau di-tag\n`;
  txt +=
    responseType === "voice" ? `> ℹ*Respuesta en nota de voz*
` : "";
  txt += `> ℹ️ Ketik *.autoai off* a la inhabilitación`;

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
