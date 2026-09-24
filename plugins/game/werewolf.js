import { getDatabase } from "../../src/lib/ourin-database.js";
/**
 * 🐺 WEREWOLF GAME
 * Social deduction game for WhatsApp
 *
 * Based on reference: RTXZY-MD-pro/lib/werewolf.js
 * Enhanced for OurinAI
 */
import config from "../../config.js";
import fs from "fs";
import path from "path";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "werewolf",
  alias: ["ww", "wwgc"],
  category: "game",
  description: "Juega al Hombre Lobo con otros jugadores.",
  usage: ".ww <create|join|start|vote|player|exit|delete>",
  example: ".ww create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.werewolfGames) global.werewolfGames = {};

let thumbWW = null;
let thumbNight = null;
let thumbDay = null;
let thumbWin = null;

try {
  const assetsPath = path.join(process.cwd(), "assets", "images");
  if (fs.existsSync(path.join(assetsPath, "ourin-games.jpg"))) {
    thumbWW = fs.readFileSync(path.join(assetsPath, "ourin-games.jpg"));
  }
  if (fs.existsSync(path.join(assetsPath, "ourin.jpg"))) {
    thumbNight = fs.readFileSync(path.join(assetsPath, "ourin.jpg"));
    thumbDay = fs.readFileSync(path.join(assetsPath, "ourin.jpg"));
  }
  if (fs.existsSync(path.join(assetsPath, "ourin-winner.jpg"))) {
    thumbWin = fs.readFileSync(path.join(assetsPath, "ourin-winner.jpg"));
  }
} catch (e) {
  console.log("[WW] No se pudieron cargar las miniaturas:", e.message);
}

const ROLES = {
  werewolf: {
    emoji: "🐺",
    name: "Werewolf",
    team: "wolf",
    desc: "Mata a un aldeano cada noche",
  },
  seer: {
    emoji: "🔮",
    name: "Seer",
    team: "village",
    desc: "Mira a los jugadores de rol todas las noches.",
  },
  guardian: {
    emoji: "🛡️",
    name: "Guardian",
    team: "village",
    desc: "Protege a un jugador cada noche",
  },
  sorcerer: {
    emoji: "🧙",
    name: "Sorcerer",
    team: "wolf",
    desc: "Descubra quién es Seer.",
  },
  villager: {
    emoji: "👨‍🌾",
    name: "Villager",
    team: "village",
    desc: "Debate y vota para descubrir al hombre lobo",
  },
};

const WIN_REWARD = { koin: 5000, exp: 1000 };
const MIN_PLAYERS = 4;
const MAX_PLAYERS = 15;
const PHASE_DURATION = {
  night: 60000, // 60 seconds
  day: 90000, // 90 seconds
};

function getWWContextInfo(
  title = "🐺 WEREWOLF",
  body = "¡Juego de deducción social!",
  thumbBuffer = thumbWW,
  mentions,
) {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const contextInfo = {
    forwardingScore: 9999,
    isForwarded: true,
    mentionedJid: mentions,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (thumbBuffer) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbBuffer,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: config.saluran?.link || "",
    };
  }

  return contextInfo;
}

// Generate roles based on player count
function generateRoles(playerCount) {
  const roles = [];

  // Role distribution based on player count (from reference)
  if (playerCount === 4) {
    roles.push("werewolf", "seer", "guardian", "villager");
  } else if (playerCount === 5) {
    roles.push("werewolf", "seer", "guardian", "villager", "villager");
  } else if (playerCount === 6) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
    );
  } else if (playerCount === 7) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 8) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 9) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 10) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 11) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount >= 12) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "guardian",
      "sorcerer",
    );
    while (roles.length < playerCount) roles.push("villager");
  }

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

// Get role description for PM
function getRoleDescription(role, prefix = ".") {
  const descriptions = {
    werewolf:
      `🐺 *WEREWOLF*\n\n` +
      `¡Usted es un depredador nocturno!

` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: matar a todos los villanos
` +
      `┃ ⚔️ Habilidad: matar a un jugador cada noche
` +
      `┃ 🕐 Acción: Por la noche
` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Por la noche, escribe:
` +
      `> \`${prefix}wwkill <número>\` por mensaje privado al bot`,
    seer:
      `🔮 *SEER*\n\n` +
      `¡Puedes ver la identidad del jugador!

` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: ayudar a los aldeanos
` +
      `┃ 🔮 Habilidad: Mira el rol de un jugador
` +
      `┃ 🕐 Acción: Por la noche
` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Por la noche, escribe:
` +
      `> \`${prefix}wwsee <número>\` por mensaje privado al bot`,
    guardian:
      `🛡️ *GUARDIAN*\n\n` +
      `¡Puedes proteger al jugador!

` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: proteger a los aldeanos
` +
      `┃ 🛡️ Habilidad: proteger a un jugador
` +
      `┃ 🕐 Acción: Por la noche
` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Por la noche, escribe:
` +
      `> \`${prefix}wwprotect <número>\` por mensaje privado al bot`,
    sorcerer:
      `🧙 *SORCERER*\n\n` +
      `¡Usted es un aliado Werewolf!

` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: ayudar al hombre lobo a ganar
` +
      `┃ 🔍 Habilidad: Verifique si el objetivo es Seer
` +
      `┃ 🕐 Acción: Por la noche
` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Por la noche, escribe:
` +
      `> \`${prefix}wwsorcerer <número>\` por mensaje privado al bot`,
    villager:
      `👨‍🌾 *VILLAGER*\n\n` +
      `¡Ustedes son ciudadanos comunes!

` +
      `╭┈┈⬡「 📋 *INFO* 」\n` +
      `┃ 🎯 Objetivo: encontrar al hombre lobo
` +
      `┃ 🗳️ Habilidad: Votar de día
` +
      `┃ 🕐 Acción: El día
` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> ¡Debate y vota para descubrir al hombre lobo!
` +
      `> \`${prefix}ww vote <número>\` en el grupo`,
  };
  return descriptions[role] || "Rol desconocido";
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const target = args[1];
  const ww = global.werewolfGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  const commands = {
    create: async () => {
      if (ww[m.chat]) {
        const game = ww[m.chat];
        if (game.status === "waiting") {
          return m.reply(
            `❌ *YA EXISTE UNA SALA*

` +
              `La sala sigue esperando jugadores
` +
              `Escribe \`${prefix}ww join\` para unirte
` +
              `Host: @${game.owner.split("@")[0]}`,
            { mentions: [game.owner] },
          );
        }
        return m.reply(`¡Ya hay una partida en curso! Espera hasta que termine.`);
      }

      // Check if player already in another room
      const existingRoom = Object.entries(ww).find(([chatId, room]) =>
        room.players.some((p) => p.id === m.sender),
      );
      if (existingRoom) {
        return m.reply(`¡Ya estás en una partida de otro grupo!`);
      }

      // Create new game room
      ww[m.chat] = {
        room: m.chat,
        owner: m.sender,
        status: "waiting",
        day: 0,
        phase: "lobby",
        players: [
          {
            id: m.sender,
            number: 1,
            role: null,
            alive: true,
            voted: false,
            skillUsed: false,
          },
        ],
        dead: [],
        votes: {},
        nightActions: {
          kill: null,
          protect: null,
          see: null,
          sorcerer: null,
        },
        createdAt: Date.now(),
        timeout: null,
      };

      await m.react("🐺");
      await m.reply(
        `🐺 *WEREWOLF GAME*\n\n` +
          `¡Sala creada correctamente!

` +
          `╭┈┈⬡「 📋 *INFORMACIÓN DE LA SALA* 」
` +
          `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
          `┃ 👥 Player: 1/${MAX_PLAYERS}\n` +
          `┃ ⏱️ Min: ${MIN_PLAYERS} player\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🎮 *CÓMO JUGAR* 」
` +
          `┃ ➕ \`${prefix}ww join\` - Unirse
` +
          `┃ ▶️ \`${prefix}ww start\` - Iniciar (anfitrión)
` +
          `┃ 👥 \`${prefix}ww player\` - Lista de jugadores
` +
          `┃ 🚪 \`${prefix}ww exit\` - Salir
` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: [m.sender] },
      );
    },

    join: async () => {
      if (!ww[m.chat]) {
        return m.reply(
          `¡Todavía no hay ninguna sala!
> Escribe \`${prefix}ww create\` para crear una sala`,
        );
      }

      if (ww[m.chat].status !== "waiting") {
        return m.reply(`¡La partida ya comenzó! Espera a la siguiente ronda.`);
      }

      if (ww[m.chat].players.length >= MAX_PLAYERS) {
        return m.reply(`¡La sala está llena! (Max ${MAX_PLAYERS} player)`);
      }

      if (ww[m.chat].players.some((p) => p.id === m.sender)) {
        return m.reply(`¡Ya te uniste!`);
      }

      const existingRoom = Object.entries(ww).find(
        ([chatId, room]) =>
          chatId !== m.chat && room.players.some((p) => p.id === m.sender),
      );
      if (existingRoom) {
        return m.reply(`¡Ya estás en una partida de otro grupo!`);
      }

      ww[m.chat].players.push({
        id: m.sender,
        number: ww[m.chat].players.length + 1,
        role: null,
        alive: true,
        voted: false,
        skillUsed: false,
      });

      const playerList = ww[m.chat].players
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      const canStart = ww[m.chat].players.length >= MIN_PLAYERS;

      await m.react("✅");
      await m.reply(
        `✅ *JUGADOR INCORPORADO*

` +
          `@${m.sender.split("@")[0]} ¡se unió!

` +
          `╭┈┈⬡「 👥 *LISTA DE JUGADORES* 」
` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `Total: ${ww[m.chat].players.length}/${MIN_PLAYERS} (min)\n` +
          (canStart
            ? `✅ ¡Ya se puede iniciar! \`${prefix}ww start\``
            : `🕕 Faltan ${MIN_PLAYERS - ww[m.chat].players.length} jugadores`),
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );
    },

    start: async () => {
      if (!ww[m.chat]) {
        return m.reply(`¡Todavía no hay ninguna sala!`);
      }

      if (ww[m.chat].status !== "waiting") {
        return m.reply(`¡La partida ya está en curso!`);
      }

      if (ww[m.chat].owner !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`¡Solo el anfitrión puede iniciar la partida!`);
      }

      if (ww[m.chat].players.length < MIN_PLAYERS) {
        return m.reply(
          `❌ Minimal ${MIN_PLAYERS} player!
> Actualmente: ${ww[m.chat].players.length} player`,
        );
      }

      // Generate and assign roles
      const roles = generateRoles(ww[m.chat].players.length);
      ww[m.chat].players.forEach((p, i) => {
        p.role = roles[i];
      });

      ww[m.chat].status = "playing";
      ww[m.chat].day = 1;
      ww[m.chat].phase = "night";

      // Send role to each player via PM
      for (const player of ww[m.chat].players) {
        try {
          await sock.sendMessage(player.id, {
            text: getRoleDescription(player.role, prefix),
            contextInfo: getWWContextInfo(
              `${ROLES[player.role].emoji} ${ROLES[player.role].name}`,
              "¡Tu rol!",
            ),
          });
        } catch (e) {
          console.log(`[WW] No se pudo enviar el rol a ${player.id}:`, e.message);
        }
      }

      // Build player list
      const playerList = ww[m.chat].players
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      // Count roles
      const roleCount = {};
      ww[m.chat].players.forEach((p) => {
        roleCount[p.role] = (roleCount[p.role] || 0) + 1;
      });
      const roleInfo = Object.entries(roleCount)
        .map(
          ([role, count]) =>
            `${ROLES[role].emoji} ${ROLES[role].name}: ${count}`,
        )
        .join("\n");

      await m.react("🌙");
      await m.reply(
        `🐺 *¡PARTIDA INICIADA!*

` +
          `🌙 *Noche 1*

` +
          `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🎭 *ROLES* 」\n` +
          `${roleInfo
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `📩 ¡Revisa el chat privado para conocer tu rol!
` +
          `🌙 El hombre lobo está cazando...
` +
          `⏱️ Duración de la noche: ${PHASE_DURATION.night / 1000} segundos`,
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );

      // Send night skill prompts to special roles
      await sendNightPrompts(m.chat, sock, prefix);

      // Set timeout for night phase
      ww[m.chat].timeout = setTimeout(() => {
        processNightActions(m.chat, sock, db, prefix);
      }, PHASE_DURATION.night);
    },

    vote: async () => {
      if (!ww[m.chat] || ww[m.chat].status !== "playing") {
        return m.reply(`¡No hay ninguna partida activa!`);
      }

      if (ww[m.chat].phase !== "day") {
        return m.reply(
          `¡Ahora no es el momento de votar!
> Phase: ${ww[m.chat].phase === "night" ? "🌙 Noche" : ww[m.chat].phase}`,
        );
      }

      const player = ww[m.chat].players.find((p) => p.id === m.sender);
      if (!player) {
        return m.reply(`¡No eres jugador de esta partida!`);
      }

      if (!player.alive) {
        return m.reply(`¡Ya estás muerto/a y no puedes votar!`);
      }

      if (player.voted) {
        return m.reply(`¡Ya votaste! Espera el resultado.`);
      }

      if (!target) {
        const alivePlayers = ww[m.chat].players.filter((p) => p.alive);
        const list = alivePlayers
          .map((p) => `${p.number}. @${p.id.split("@")[0]}`)
          .join("\n");
        return m.reply(
          `🗳️ *VOTING*\n\n` +
            `Elige a quién quieres eliminar:

` +
            `${list}\n\n` +
            `Escribe: \`${prefix}ww vote <número>\``,
          { mentions: alivePlayers.map((p) => p.id) },
        );
      }

      const targetNum = parseInt(target);
      if (isNaN(targetNum)) {
        return m.reply(
          `❌ ¡Ingresa el número del jugador! Ejemplo: \`${prefix}ww vote 2\``,
        );
      }

      const targetPlayer = ww[m.chat].players.find(
        (p) => p.number === targetNum,
      );
      if (!targetPlayer) {
        return m.reply(`❌ No se encontró al jugador número ${targetNum}.`);
      }

      if (!targetPlayer.alive) {
        return m.reply(`¡Ese jugador ya está muerto!`);
      }

      player.voted = true;
      ww[m.chat].votes[targetPlayer.id] =
        (ww[m.chat].votes[targetPlayer.id] || 0) + 1;

      const alivePlayers = ww[m.chat].players.filter((p) => p.alive);
      const votedCount = alivePlayers.filter((p) => p.voted).length;

      await m.react("🗳️");
      await m.reply(
        `🗳️ *VOTO REGISTRADO*

` +
          `@${m.sender.split("@")[0]} ➜ @${targetPlayer.id.split("@")[0]}\n\n` +
          `Progress: ${votedCount}/${alivePlayers.length}`,
        { mentions: [m.sender, targetPlayer.id] },
      );

      // Check if all votes are in
      if (votedCount >= alivePlayers.length) {
        if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
        await executeVote(m.chat, sock, db, prefix);
      }
    },

    player: async () => {
      if (!ww[m.chat]) {
        return m.reply(`¡No hay ninguna partida en esta sala!`);
      }

      const playerList = ww[m.chat].players
        .map((p, i) => {
          const status = p.alive
            ? "✅"
            : `☠️ (${ROLES[p.role]?.name || "Desconocido"})`;
          return `${p.number}. @${p.id.split("@")[0]} ${status}`;
        })
        .join("\n");

      const phaseEmoji =
        ww[m.chat].phase === "night"
          ? "🌙"
          : ww[m.chat].phase === "day"
            ? "☀️"
            : "🕕";

      await m.reply(
        `🐺 *WEREWOLF - STATUS*\n\n` +
          `╭┈┈⬡「 📊 *GAME INFO* 」\n` +
          `┃ 📅 Day: ${ww[m.chat].day}\n` +
          `┃ ${phaseEmoji} Phase: ${ww[m.chat].phase}\n` +
          `┃ 👤 Alive: ${ww[m.chat].players.filter((p) => p.alive).length}\n` +
          `┃ ☠️ Dead: ${ww[m.chat].dead.length}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );
    },

    exit: async () => {
      if (!ww[m.chat]) {
        return m.reply(`¡No hay ninguna partida en esta sala!`);
      }

      const playerIdx = ww[m.chat].players.findIndex((p) => p.id === m.sender);
      if (playerIdx === -1) {
        return m.reply(`¡No estás en esta partida!`);
      }

      if (ww[m.chat].status === "playing") {
        return m.reply(`¡No puedes salir mientras la partida está en curso!`);
      }

      ww[m.chat].players.splice(playerIdx, 1);
      ww[m.chat].players.forEach((p, i) => (p.number = i + 1));

      if (ww[m.chat].players.length === 0) {
        if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
        delete ww[m.chat];
        return m.reply(`🗑️ La sala se eliminó porque estaba vacía.`);
      }

      // Transfer host if owner left
      if (ww[m.chat].owner === m.sender && ww[m.chat].players.length > 0) {
        ww[m.chat].owner = ww[m.chat].players[0].id;
        await m.reply(
          `👋 @${m.sender.split("@")[0]} salió.\n` +
            `👑 Nuevo anfitrión: @${ww[m.chat].owner.split("@")[0]}`,
          { mentions: [m.sender, ww[m.chat].owner] },
        );
      } else {
        await m.reply(`👋 @${m.sender.split("@")[0]} salió de la partida.`, {
          mentions: [m.sender],
        });
      }
    },

    delete: async () => {
      if (!ww[m.chat]) {
        return m.reply(`¡No hay ninguna partida en esta sala!`);
      }

      const isOwner = ww[m.chat].owner === m.sender;
      const isBotOwner = config.isOwner?.(m.sender);

      if (!isOwner && !isBotOwner) {
        return m.reply(`¡Solo el anfitrión o el propietario del bot pueden eliminarla!`);
      }

      if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
      delete ww[m.chat];

      await m.react("🗑️");
      await m.reply(`🗑️ ¡Partida eliminada!`);
    },
  };

  // Show help if no action
  if (!action || !commands[action]) {
    return m.reply(
      `🐺 *WEREWOLF GAME*\n\n` +
        `¡Juego social para encontrar al hombre lobo!

` +
        `╭┈┈⬡「 🎮 *COMMANDS* 」\n` +
        `┃ 🆕 \`${prefix}ww create\` - Crear una sala
` +
        `┃ ➕ \`${prefix}ww join\` - Unirse
` +
        `┃ ▶️ \`${prefix}ww start\` - Comienza (host)
` +
        `┃ 🗳️ \`${prefix}ww vote <no>\` - Vote\n` +
        `┃ 👥 \`${prefix}ww player\` - Lista de jugadores
` +
        `┃ 🚪 \`${prefix}ww exit\` - Salir
` +
        `┃ 🗑️ \`${prefix}ww delete\` - Elimina la habitación
` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 🎭 *ROLES* 」\n` +
        `┃ 🐺 Hombre lobo: mata aldeanos
` +
        `┃ 🧙 Sorcerer - Busca a los Vectores
` +
        `Seer - Mira el papel
` +
        `┃ 🛡️ Guardián: protege
` +
        `┃ 👨‍🌾 Aldeano: vota al hombre lobo
` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `Min: ${MIN_PLAYERS} players | Max: ${MAX_PLAYERS} players`,
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[WEREWOLF ERROR]", error);
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

// Send night skill prompts to players
async function sendNightPrompts(chatId, sock, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return;

  const game = ww[chatId];
  const alivePlayers = game.players.filter((p) => p.alive);

  // Build player list for prompts
  let playerListNormal = "";
  let playerListWolf = "";

  alivePlayers.forEach((p) => {
    playerListNormal += `(${p.number}) @${p.id.split("@")[0]}\n`;
    const roleTag =
      p.role === "werewolf" || p.role === "sorcerer"
        ? ` [${ROLES[p.role].name}]`
        : "";
    playerListWolf += `(${p.number}) @${p.id.split("@")[0]}${roleTag}\n`;
  });

  const mentions = alivePlayers.map((p) => p.id);

  // Send prompts based on role
  for (const player of alivePlayers) {
    try {
      let text = "";

      switch (player.role) {
        case "werewolf":
          text =
            `🐺 *NOCHE Y DÍA*

` +
            `¡Es hora de cazar! Elige un objetivo:

` +
            `${playerListWolf}\n` +
            `> Escribe \`${prefix}wwkill <número>\` para matar`;
          break;
        case "seer":
          text =
            `🔮 *NOCHE Y DÍA*

` +
            `¿De quién quieres ver el rol?

` +
            `${playerListNormal}\n` +
            `> Escribe \`${prefix}wwsee <número>\` para ver el rol`;
          break;
        case "guardian":
          text =
            `🛡️ *NOCHE Y DÍA*

` +
            `¿A quién quieres proteger?

` +
            `${playerListNormal}\n` +
            `> Escribe \`${prefix}wwprotect <número>\` para proteger`;
          break;
        case "sorcerer":
          text =
            `🧙 *NOCHE Y DÍA*

` +
            `¡Encuentra quién es Seer!

` +
            `${playerListWolf}\n` +
            `> Escribe \`${prefix}wwsorcerer <número>\` para comprobar`;
          break;
        case "villager":
          text =
            `👨‍🌾 *LA NOCHE Y EL DÍA*

` +
            `Como aldeano, ten cuidado.
` +
            `Tal vez usted sea el próximo objetivo.

` +
            `${playerListNormal}`;
          break;
      }

      if (text) {
        await sock.sendMessage(player.id, {
          text,
          mentions,
          contextInfo: getWWContextInfo(
            "🌙 NIGHT",
            "¡Usa tus habilidades!",
            thumbNight,
            mentions,
          ),
        });
      }
    } catch (e) {
      console.log(`[WW] No se pudo enviar la instrucción a ${player.id}:`, e.message);
    }
  }
}

// Process night actions
async function processNightActions(chatId, sock, db, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId] || ww[chatId].phase !== "night") return;

  let killTarget = ww[chatId].nightActions.kill;
  const protectTarget = ww[chatId].nightActions.protect;

  let nightReport = `☀️ *- ¿Qué?${ww[chatId].day}*\n\n`;

  // Process kill if not protected
  if (killTarget && killTarget !== protectTarget) {
    const victim = ww[chatId].players.find((p) => p.id === killTarget);
    if (victim && victim.alive) {
      victim.alive = false;
      ww[chatId].dead.push(victim);
      nightReport += `☠️ @${victim.id.split("@")[0]} ¡Encontrado muerto!
`;
      nightReport += `> Role: ${ROLES[victim.role].emoji} ${ROLES[victim.role].name}\n\n`;
    }
  } else if (killTarget && killTarget === protectTarget) {
    nightReport += `🛡️ ¡El guardián cubre con éxito el objetivo!
`;
    nightReport += `> No hay bajas esta noche.

`;
  } else {
    nightReport += `🌅 Una noche tranquila...
`;
    nightReport += `> Sin bajas.

`;
  }

  // Check win condition
  const winner = checkWinner(chatId);
  if (winner) {
    await sock.sendMessage(chatId, {
      text: nightReport,
      mentions: ww[chatId].players.map((p) => p.id),
      contextInfo: getWWContextInfo(
        "☀️ DAY",
        "Ha llegado la mañana...",
        thumbDay,
        ww[chatId].players.map((p) => p.id),
      ),
    });
    await endGame(chatId, sock, db, winner);
    return;
  }

  // Change phase to day
  ww[chatId].phase = "day";
  ww[chatId].votes = {};
  ww[chatId].nightActions = {
    kill: null,
    protect: null,
    see: null,
    sorcerer: null,
  };
  ww[chatId].players.forEach((p) => {
    p.voted = false;
    p.skillUsed = false;
  });

  const alivePlayers = ww[chatId].players.filter((p) => p.alive);
  const playerList = alivePlayers
    .map((p) => `${p.number}. @${p.id.split("@")[0]}`)
    .join("\n");

  nightReport += `╭┈┈⬡「 👥 *JUGADORES VIVOS* 」
`;
  nightReport += `${playerList
    .split("\n")
    .map((l) => `┃ ${l}`)
    .join("\n")}\n`;
  nightReport += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  nightReport += `> 🗳️ ¡Es hora de votar!
`;
  nightReport += `> Escribe \`${prefix}ww vote <número>\`
`;
  nightReport += `> ⏱️ Tiempo: ${PHASE_DURATION.day / 1000} segundos`;

  await sock.sendMessage(chatId, {
    text: nightReport,
    mentions: ww[chatId].players.map((p) => p.id),
    contextInfo: getWWContextInfo(
      "☀️ DAY",
      "Voting time!",
      thumbDay,
      ww[chatId].players.map((p) => p.id),
    ),
  });

  ww[chatId].timeout = setTimeout(() => {
    executeVote(chatId, sock, db, prefix);
  }, PHASE_DURATION.day);
}

// Execute vote results
async function executeVote(chatId, sock, db, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId] || ww[chatId].phase !== "day") return;

  let maxVotes = 0;
  let eliminated = null;
  let isTie = false;

  for (const [playerId, votes] of Object.entries(ww[chatId].votes)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminated = playerId;
      isTie = false;
    } else if (votes === maxVotes && maxVotes > 0) {
      isTie = true;
    }
  }

  let resultText = `⚖️ *VOICE VOICE*

`;

  if (isTie || maxVotes === 0) {
    resultText += `🤷 ¡Nada ha sido eliminado!
`;
    resultText += `> ${isTie ? "¡Empate en la votación!" : "No hay nada de voto."}\n\n`;
  } else if (eliminated) {
    const player = ww[chatId].players.find((p) => p.id === eliminated);
    if (player) {
      player.alive = false;
      ww[chatId].dead.push(player);

      resultText += `⚰️ ¡@${eliminated.split("@")[0]} fue eliminado!\n`;
      resultText += `> Role: ${ROLES[player.role].emoji} ${ROLES[player.role].name}\n`;
      resultText += `> Votes: ${maxVotes}\n\n`;
    }
  }

  // Check win condition
  const winner = checkWinner(chatId);
  if (winner) {
    await sock.sendMessage(chatId, {
      text: resultText,
      mentions: eliminated ? [eliminated] : [],
      contextInfo: getWWContextInfo("⚖️ VOTING", "Resultados de la votación", thumbDay),
    });
    await endGame(chatId, sock, db, winner);
    return;
  }

  // Change to night phase
  ww[chatId].phase = "night";
  ww[chatId].day++;
  ww[chatId].nightActions = {
    kill: null,
    protect: null,
    see: null,
    sorcerer: null,
  };
  ww[chatId].players.forEach((p) => {
    p.voted = false;
    p.skillUsed = false;
  });

  resultText += `🌙 *- ¿Qué?${ww[chatId].day}*\n\n`;
  resultText += `> El hombre lobo está cazando...
`;
  resultText += `> Funciones especiales, ¡utiliza tus habilidades en el PM!
`;
  resultText += `> ⏱️ Tiempo: ${PHASE_DURATION.night / 1000} segundos`;

  await sock.sendMessage(chatId, {
    text: resultText,
    mentions: eliminated ? [eliminated] : [],
    contextInfo: getWWContextInfo(
      "🌙 NIGHT",
      "El hombre lobo está cazando...",
      thumbNight,
    ),
  });

  // Send night prompts
  await sendNightPrompts(chatId, sock, prefix);

  ww[chatId].timeout = setTimeout(() => {
    processNightActions(chatId, sock, db, prefix);
  }, PHASE_DURATION.night);
}

// Check win condition
function checkWinner(chatId) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return null;

  const alivePlayers = ww[chatId].players.filter((p) => p.alive);
  const wolves = alivePlayers.filter((p) => ROLES[p.role]?.team === "wolf");
  const villagers = alivePlayers.filter(
    (p) => ROLES[p.role]?.team === "village",
  );

  if (wolves.length === 0) return "village";
  if (wolves.length >= villagers.length) return "wolf";

  return null;
}

// End game and give rewards
async function endGame(chatId, sock, db, winner) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return;

  if (ww[chatId].timeout) clearTimeout(ww[chatId].timeout);

  const winningTeam = winner === "wolf" ? "wolf" : "village";
  const winningPlayers = ww[chatId].players.filter(
    (p) => ROLES[p.role]?.team === winningTeam,
  );

  // Give rewards to winners
  for (const player of winningPlayers) {
    try {
      db.updateKoin(player.id, WIN_REWARD.koin);
      const user = db.getUser(player.id);
      if (user) {
        user.exp = (user.exp || 0) + WIN_REWARD.exp;
        db.setUser(player.id, user);
      }
    } catch (e) {
      console.log(`[WW] No se pudo entregar la recompensa a ${player.id}:`, e.message);
    }
  }

  const allPlayers = ww[chatId].players
    .map((p) => {
      const status = p.alive ? "✅" : "☠️";
      const isWinner = winningPlayers.some((w) => w.id === p.id) ? "🏆" : "";
      return `${status} @${p.id.split("@")[0]} - ${ROLES[p.role].emoji} ${ROLES[p.role].name} ${isWinner}`;
    })
    .join("\n");

  await sock.sendMessage(chatId, {
    text:
      `🎉 *GAME OVER!*\n\n` +
      `${winner === "wolf" ? "🐺 *¡GANAN LOS HOMBRES LOBO!*" : "👨‍🌾 *¡GANAN LOS ALDEANOS!*"}\n\n` +
      `╭┈┈⬡「 👥 *TODOS LOS JUGADORES* 」
` +
      `${allPlayers
        .split("\n")
        .map((l) => `┃ ${l}`)
        .join("\n")}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `╭┈┈⬡「 🎁 *PREMIO* 」
` +
      `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas
` +
      `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> GG WP! ¿Juega de nuevo? \`${config.command?.prefix || "."}ww create\``,
    mentions: ww[chatId].players.map((p) => p.id),
    contextInfo: getWWContextInfo(
      "🏆 GAME OVER",
      `${winner === "wolf" ? "Werewolf" : "Villager"} wins!`,
      thumbWin,
    ),
  });

  delete ww[chatId];
}

// Night action handler for PM commands
async function nightActionHandler(m, { sock }) {
  const db = getDatabase();
  const ww = global.werewolfGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  // Find the game this player is in
  const chatId = Object.keys(ww).find(
    (id) =>
      ww[id].players.some((p) => p.id === m.sender && p.alive) &&
      ww[id].phase === "night",
  );

  if (!chatId) {
    return m.reply(
      `❌ ¡No estás en un juego de hombres lobo o en una fase nocturna!`,
    );
  }

  const game = ww[chatId];
  const player = game.players.find((p) => p.id === m.sender);
  if (!player || !player.alive) {
    return m.reply(`❌ ¡Estás muerto o no eres un jugador!`);
  }

  // Check if skill already used
  if (player.skillUsed) {
    return m.reply(`❌ ¡Has estado usando habilidades esta noche!`);
  }

  const cmd = m.command?.toLowerCase();
  const targetNum = parseInt(m.args?.[0]);

  if (isNaN(targetNum)) {
    return m.reply(`❌ ¡Introdúzcase el número de destino! \`${prefix}${cmd} 2\``);
  }

  const targetPlayer = game.players.find(
    (p) => p.number === targetNum && p.alive,
  );
  if (!targetPlayer) {
    return m.reply(`❌ ¡El objetivo es inválido o muerto!`);
  }

  // Process based on command and role
  if (cmd === "wwkill" && player.role === "werewolf") {
    if (targetPlayer.role === "werewolf" || targetPlayer.role === "sorcerer") {
      return m.reply(`❌ ¡No puedo matar a un compañero!`);
    }
    game.nightActions.kill = targetPlayer.id;
    player.skillUsed = true;
    await m.reply(
      `🐺 *OBJETIVO ELEGIDO*

` +
        `Target: @${targetPlayer.id.split("@")[0]}\n` +
        `> Esperando que la noche termine...`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  if (cmd === "wwprotect" && player.role === "guardian") {
    game.nightActions.protect = targetPlayer.id;
    player.skillUsed = true;
    await m.reply(
      `🛡️ *OBJETIVO PROTEGIDO*

` +
        `Protegiendo a: @${targetPlayer.id.split("@")[0]}\n` +
        `> Esperando que la noche termine...`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  if (cmd === "wwsee" && player.role === "seer") {
    const roleInfo = ROLES[targetPlayer.role];
    player.skillUsed = true;
    await m.reply(
      `🔮 *RESULTADO DE LA VISIÓN*

` +
        `@${targetPlayer.id.split("@")[0]} es:
` +
        `${roleInfo.emoji} *${roleInfo.name}*\n\n` +
        `> Team: ${roleInfo.team === "wolf" ? "🐺 Wolf" : "👨‍🌾 Village"}`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  if (cmd === "wwsorcerer" && player.role === "sorcerer") {
    const isSeer = targetPlayer.role === "seer";
    player.skillUsed = true;
    await m.reply(
      `🧙 *RESULTADO DE LA INVESTIGACIÓN*

` +
        `@${targetPlayer.id.split("@")[0]}\n` +
        `${isSeer ? "✅ *¡ES EL VIDENTE!*" : "❌ *no es el Vidente*"}\n\n` +
        `> ¡Sigue ayudando al hombre lobo!`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  // Wrong role for command
  return m.reply(
    `❌ ¡No tienes esta habilidad!
> Tu papel: ${ROLES[player.role]?.name || "Desconocido"}`,
  );
}

export {
  pluginConfig as config,
  handler,
  nightActionHandler,
  ROLES,
  getWWContextInfo,
};
