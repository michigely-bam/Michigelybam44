import { getDatabase } from "../../src/lib/ourin-database.js";
/**
 * 🐍🎲 SERPIENTES Y ESCALERAS GAME
 * Classic snake and ladder game with visual board
 *
 * Based on reference: RTXZY-MD-pro/plugins/game-ulartangga.js
 * Enhanced for OurinAI with visual board and full contextInfo
 */
import {
  drawBoard,
  getRandomMap,
  DICE_STICKERS,
} from "../../src/lib/ourin-game-ulartangga.js";
import config from "../../config.js";
import fs from "fs";
import path from "path";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "ulartangga",
  alias: ["ut", "snakeladder", "sl"],
  category: "game",
  description: "Jugando escaleras de serpiente con otro jugador con una tabla visual",
  usage: ".ulartangga <create|join|start|info|exit|delete>",
  example: ".ulartangga create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.ulartanggaGames) global.ulartanggaGames = {};

const PLAYER_COLORS = ["🔴", "🟡", "🟢", "🔵"];
const PLAYER_NAMES = ["Rojo", "Amarillo", "Verde", "Azul"];

const WIN_REWARD = { koin: 2000, exp: 1000, energi: 5 };

function uniqueMentions(mentions = []) {
  return [...new Set((mentions || []).filter(Boolean))];
}

let thumbUT = null;
try {
  const thumbPath = path.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-games.jpg",
  );
  if (fs.existsSync(thumbPath)) {
    thumbUT = fs.readFileSync(thumbPath);
  }
} catch (e) {}

function getUTContextInfo(
  title = "🐍🎲 SERPIENTES Y ESCALERAS",
  body = "¡Un juego clásico!",
  mentions = [],
) {
  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const contextInfo = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (thumbUT) {
    contextInfo.externalAdReply = {
      title: title,
      body: body,
      thumbnail: thumbUT,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: config.saluran?.link || "",
    };
  }

  const normalizedMentions = uniqueMentions(mentions);
  if (normalizedMentions.length) {
    contextInfo.mentionedJid = normalizedMentions;
  }
  return contextInfo;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const ut = global.ulartanggaGames;
  const prefix = m.prefix || config.command?.prefix || ".";

  const commands = {
    create: async () => {
      if (ut[m.chat]) {
        return sock.sendMessage(
          m.chat,
          {
            text:
              `❌ *YA EXISTE UNA SALA*

` +
              `> ¡Todavía hay una partida activa en este chat!
` +
              `> Host: @${ut[m.chat].host.split("@")[0]}\n` +
              `> Status: ${ut[m.chat].status}`,
            contextInfo: getUTContextInfo(
              "🐍🎲 SERPIENTES Y ESCALERAS",
              "¡Juego clásico!",
              [ut[m.chat].host],
            ),
          },
          { quoted: m },
        );
      }

      const mapConfig = getRandomMap();

      ut[m.chat] = {
        date: Date.now(),
        status: "WAITING",
        host: m.sender,
        players: {},
        turn: 0,
        map: mapConfig.map,
        mapName: mapConfig.name,
        snakesLadders: mapConfig.snakesLadders,
        stabil_x: mapConfig.stabil_x,
        stabil_y: mapConfig.stabil_y,
      };
      ut[m.chat].players[m.sender] = { rank: "HOST", position: 1 };

      await m.react("🎲");
      await sock.sendMessage(
        m.chat,
        {
          text:
            `🐍🎲 *SERPIENTES Y ESCALERAS*

` +
            `¡Sala creada correctamente!

` +
            `╭┈┈⬡「 📋 *INFORMACIÓN DE LA SALA* 」
` +
            `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
            `┃ 👥 Players: 1/4\n` +
            `┃ 🗺️ Map: ${mapConfig.name}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `╭┈┈⬡「 🎮 *COMMANDS* 」\n` +
            `┃ ➕ \`${prefix}ut join\` - Unirse
` +
            `┃ ▶️ \`${prefix}ut start\` - Iniciar
` +
            `┃ ℹ️ \`${prefix}ut info\` - Información de la sala
` +
            `┃ 🚪 \`${prefix}ut exit\` - Salir
` +
            `╰┈┈┈┈┈┈┈┈⬡`,
          contextInfo: getUTContextInfo("🎲 ROOM CREATED", "¡Únete!", [
            m.sender,
          ]),
        },
        { quoted: m },
      );
    },

    join: async () => {
      if (!ut[m.chat]) {
        return m.reply(
          `¡No hay ninguna sesión de juego!
> Escribe \`${prefix}ut create\` para crear una sala.`,
        );
      }

      if (ut[m.chat].players[m.sender]) {
        return m.reply(`¡Ya te uniste a esta sala!`);
      }

      const playerCount = Object.keys(ut[m.chat].players).length;
      if (playerCount >= 4) {
        return m.reply(`¡La sala está llena! (Max 4 player)`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`¡La partida está en curso; no puedes unirte!`);
      }

      ut[m.chat].players[m.sender] = { rank: "MEMBER", position: 1 };

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      await m.react("✅");
      await sock.sendMessage(
        m.chat,
        {
          text:
            `✅ *JUGADOR INCORPORADO*

` +
            `@${m.sender.split("@")[0]} ¡se unió!

` +
            `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
            `${playerList
              .split("\n")
              .map((l) => `┃ ${l}`)
              .join("\n")}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Total: ${players.length}/4\n` +
            `> ${players.length >= 2 ? `✅ ¡Ya se puede iniciar! \`${prefix}ut start\`` : "🕕 Falta 1 jugador"}`,
          contextInfo: getUTContextInfo(
            "👥 PLAYER JOINED",
            `${players.length}/4 players`,
            players,
          ),
        },
        { quoted: m },
      );
    },

    start: async () => {
      if (!ut[m.chat]) {
        return m.reply(`¡No hay ninguna sesión de juego!`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`¡La partida ya está en curso!`);
      }

      if (ut[m.chat].host !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`¡Solo el anfitrión puede iniciar la partida!`);
      }

      const players = Object.keys(ut[m.chat].players);
      if (players.length < 2) {
        return m.reply(`¡Se necesitan al menos 2 jugadores!`);
      }

      ut[m.chat].status = "PLAYING";
      ut[m.chat].turn = 0;

      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      // Draw initial board with all players at position 1
      const positions = players.map((p) => ut[m.chat].players[p].position);
      const boardImage = await drawBoard(
        ut[m.chat].map,
        positions[0] || null,
        positions[1] || null,
        positions[2] || null,
        positions[3] || null,
        ut[m.chat].stabil_x,
        ut[m.chat].stabil_y,
      );

      await m.react("🎮");

      if (boardImage) {
        await sock.sendMessage(
          m.chat,
          {
            image: boardImage,
            caption:
              `🐍🎲 *¡PARTIDA INICIADA!*

` +
              `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
              `${playerList
                .split("\n")
                .map((l) => `┃ ${l}`)
                .join("\n")}\n` +
              `╰┈┈┈┈┈┈┈┈⬡\n\n` +
              `> 🎯 Turno: @${players[0].split("@")[0]}\n` +
              `> Escribe *kocok* para lanzar el dado.`,
            contextInfo: getUTContextInfo(
              "🎮 GAME STARTED",
              "¡Lanza el dado!",
              players,
            ),
          },
          { quoted: m },
        );
      } else {
        // Fallback sin imágenes
        await sock.sendMessage(
          m.chat,
          {
            text:
              `🐍🎲 *¡PARTIDA INICIADA!*

` +
              `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
              `${playerList
                .split("\n")
                .map((l) => `┃ ${l}`)
                .join("\n")}\n` +
              `╰┈┈┈┈┈┈┈┈⬡\n\n` +
              `> 🎯 Turno: @${players[0].split("@")[0]}\n` +
              `> Escribe *kocok* para lanzar el dado.`,
            contextInfo: getUTContextInfo(
              "🎮 GAME STARTED",
              "¡Lanza el dado!",
              players,
            ),
          },
          { quoted: m },
        );
      }
    },

    info: async () => {
      if (!ut[m.chat]) {
        return m.reply(`¡No hay ninguna sesión de juego!`);
      }

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map((p, i) => {
          const pos = ut[m.chat].players[p].position;
          return `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]} - Pos: ${pos}`;
        })
        .join("\n");

      const currentTurn =
        ut[m.chat].status === "PLAYING"
          ? players[ut[m.chat].turn % players.length]
          : null;

      await sock.sendMessage(
        m.chat,
        {
          text:
            `🐍🎲 *INFORMACIÓN DE LA SALA*

` +
            `╭┈┈⬡「 📋 *ROOM* 」\n` +
            `┃ 👑 Host: @${ut[m.chat].host.split("@")[0]}\n` +
            `┃ 📍 Status: ${ut[m.chat].status}\n` +
            `┃ 🗺️ Map: ${ut[m.chat].mapName}\n` +
            `┃ 👥 Players: ${players.length}/4\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
            `${playerList
              .split("\n")
              .map((l) => `┃ ${l}`)
              .join("\n")}\n` +
            `╰┈┈┈┈┈┈┈┈⬡` +
            (currentTurn
              ? `

> 🎯 Turno: @${currentTurn.split("@")[0]}`
              : ""),
          contextInfo: getUTContextInfo(
            "📋 ROOM INFO",
            `${players.length} players`,
            players,
          ),
        },
        { quoted: m },
      );
    },

    exit: async () => {
      if (!ut[m.chat]) {
        return m.reply(`¡No hay ninguna sesión de juego!`);
      }

      if (!ut[m.chat].players[m.sender]) {
        return m.reply(`¡No estás en esta partida!`);
      }

      delete ut[m.chat].players[m.sender];
      await sock.sendMessage(
        m.chat,
        {
          text: `👋 @${m.sender.split("@")[0]} salió de la partida.`,
          contextInfo: getUTContextInfo(
            "🐍🎲 SERPIENTES Y ESCALERAS",
            "¡Juego clásico!",
            [m.sender],
          ),
        },
        { quoted: m },
      );

      if (Object.keys(ut[m.chat].players).length === 0) {
        delete ut[m.chat];
        return m.reply(`🗑️ La sala se eliminó porque no había jugadores.`);
      }

      if (!ut[m.chat].players[ut[m.chat].host]) {
        const newHost = Object.keys(ut[m.chat].players)[0];
        ut[m.chat].host = newHost;
        ut[m.chat].players[newHost].rank = "HOST";
        await sock.sendMessage(
          m.chat,
          {
            text: `👑 El anfitrión ahora es @${newHost.split("@")[0]}`,
            contextInfo: getUTContextInfo(
              "🐍🎲 SERPIENTES Y ESCALERAS",
              "¡Juego clásico!",
              [newHost],
            ),
          },
          { quoted: m },
        );
      }

      // Fix turn if playing
      if (ut[m.chat].status === "PLAYING") {
        const players = Object.keys(ut[m.chat].players);
        ut[m.chat].turn = ut[m.chat].turn % players.length;
        await sock.sendMessage(m.chat, {
          text: `> Turno: @${players[ut[m.chat].turn].split("@")[0]}
> Escribe *kocok*`,
          contextInfo: getUTContextInfo(
            "🐍🎲 SERPIENTES Y ESCALERAS",
            "¡Juego clásico!",
            [players[ut[m.chat].turn]],
          ),
        });
      }
    },

    delete: async () => {
      if (!ut[m.chat]) {
        return m.reply(`¡No hay ninguna sesión de juego!`);
      }

      if (ut[m.chat].host !== m.sender && !config.isOwner?.(m.sender)) {
        return m.reply(`¡Solo el anfitrión puede eliminar la sala!`);
      }

      delete ut[m.chat];
      await m.react("🗑️");
      await m.reply(`🗑️ ¡Sala eliminada correctamente!`);
    },
  };

  if (!action || !commands[action]) {
    return sock.sendMessage(
      m.chat,
      {
        text:
          `🐍🎲 *SERPIENTES Y ESCALERAS*

` +
          `¡Un juego clásico lleno de aventuras!
` +
          `¡Sube las escaleras, evita serpientes, ¡hasta los 100!

` +
          `╭┈┈⬡「 🎮 *COMMANDS* 」\n` +
          `┃ 🎲 \`${prefix}ut create\` - Crear una sala
` +
          `┃ ➕ \`${prefix}ut join\` - Unirse a la sala
` +
          `┃ ▶️ \`${prefix}ut start\` - Comienza el juego
` +
          `┃ ℹ️ \`${prefix}ut info\` - Información de la sala
` +
          `┃ 🚪 \`${prefix}ut exit\` - Salir
` +
          `┃ 🗑️ \`${prefix}ut delete\` - Elimina la habitación
` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🏆 *PREMIO* 」
` +
          `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas
` +
          `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
          `┃ ⚡ +${WIN_REWARD.energi} Energía
` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> Min 2 player, Max 4 player`,
        contextInfo: getUTContextInfo("🐍🎲 SERPIENTES Y ESCALERAS", "Ayo main!"),
      },
      { quoted: m },
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[ULARTANGGA ERROR]", error);
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

// ==================== Gestor de respuestas (para "kocok") ====================
async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "kocok") return false;

  const ut = global.ulartanggaGames;
  if (!ut[m.chat]) return false;
  if (ut[m.chat].status !== "PLAYING") return false;

  const players = Object.keys(ut[m.chat].players);
  if (!players.includes(m.sender)) return false;

  const currentTurn = ut[m.chat].turn % players.length;
  if (players.indexOf(m.sender) !== currentTurn) {
    await m.reply(
      `❌ ¡No es tu turno!
> Turno: @${players[currentTurn].split("@")[0]}`,
      {
        mentions: [players[currentTurn]],
      },
    );
    return true;
  }

  const db = getDatabase();

  // Roll dice
  const dadu = Math.floor(Math.random() * 6) + 1;
  const DICE_EMOJI = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  // Send dice sticker
  try {
    const diceUrl = DICE_STICKERS[dadu - 1];
    await sock.sendMessage(
      m.chat,
      {
        sticker: { url: diceUrl },
        contextInfo: getUTContextInfo(
          `🎲 DADO: ${dadu}`,
          PLAYER_NAMES[players.indexOf(m.sender)],
        ),
      },
      { quoted: m },
    );
  } catch (e) {
    // Fallback: just react with dice emoji
    await m.react(DICE_EMOJI[dadu - 1]);
  }

  const oldPos = ut[m.chat].players[m.sender].position;
  let newPos = oldPos + dadu;

  // Bounce back if over 100
  if (newPos > 100) {
    newPos = 100 - (newPos - 100);
  }

  // Check snake/ladder
  let event = "";
  const snakesLadders = ut[m.chat].snakesLadders;
  if (snakesLadders[newPos]) {
    const destination = snakesLadders[newPos];
    if (destination > newPos) {
      event = `
🪜 *¡Subiste una escalera!*`;
    } else {
      event = `
🐍 *¡Caíste en una serpiente!*`;
    }
    newPos = destination;
  }

  ut[m.chat].players[m.sender].position = newPos;

  const playerIdx = players.indexOf(m.sender);
  const color = PLAYER_COLORS[playerIdx];
  const name = PLAYER_NAMES[playerIdx];

  // Check win condition
  if (newPos === 100) {
    // Give rewards
    try {
      db.updateKoin(m.sender, WIN_REWARD.koin);
      db.updateEnergi(m.sender, WIN_REWARD.energi);
      const userData = db.getUser(m.sender) || {};
      userData.exp = (userData.exp || 0) + WIN_REWARD.exp;
      db.setUser(m.sender, userData);
    } catch (e) {
      console.log("[UT] No se pudo entregar la recompensa:", e.message);
    }

    // Draw final board
    const positions = players.map(
      (p) => ut[m.chat].players[p]?.position || null,
    );
    const boardImage = await drawBoard(
      ut[m.chat].map,
      positions[0] || null,
      positions[1] || null,
      positions[2] || null,
      positions[3] || null,
      ut[m.chat].stabil_x,
      ut[m.chat].stabil_y,
    );

    await m.react("🎉");

    if (boardImage) {
      await sock.sendMessage(m.chat, {
        image: boardImage,
        caption:
          `🎉 *¡GANADOR!*

` +
          `${color} @${m.sender.split("@")[0]} ¡A los 100!

` +
          `╭┈┈⬡「 🎁 *PREMIO* 」
` +
          `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas
` +
          `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
          `┃ ⚡ +${WIN_REWARD.energi} Energía
` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> GG WP! ¿Juega de nuevo? \`.ut create\``,
        contextInfo: getUTContextInfo("🏆 WINNER!", `${name} ¡ganó!`, [
          m.sender,
        ]),
      });
    } else {
      await sock.sendMessage(m.chat, {
        text:
          `🎉 *¡GANADOR!*

` +
          `${color} @${m.sender.split("@")[0]} ¡A los 100!

` +
          `╭┈┈⬡「 🎁 *PREMIO* 」
` +
          `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Monedas
` +
          `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
          `┃ ⚡ +${WIN_REWARD.energi} Energía
` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        contextInfo: getUTContextInfo("🏆 WINNER!", `${name} ¡ganó!`, [
          m.sender,
        ]),
      });
    }

    delete ut[m.chat];
    return true;
  }

  // Continue game
  ut[m.chat].turn++;
  const nextTurn = ut[m.chat].turn % players.length;
  const nextPlayer = players[nextTurn];

  // Draw updated board
  const positions = players.map((p) => ut[m.chat].players[p]?.position || null);
  const boardImage = await drawBoard(
    ut[m.chat].map,
    positions[0] || null,
    positions[1] || null,
    positions[2] || null,
    positions[3] || null,
    ut[m.chat].stabil_x,
    ut[m.chat].stabil_y,
  );

  if (boardImage) {
    await sock.sendMessage(m.chat, {
      image: boardImage,
      caption:
        `🎲 *DADO: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
        `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
        `> 🎯 Turno: @${nextPlayer.split("@")[0]}\n` +
        `> Escribe *kocok*`,
      contextInfo: getUTContextInfo("🎲 TURNO", PLAYER_NAMES[nextTurn], [
        nextPlayer,
      ]),
    });
  } else {
    await sock.sendMessage(m.chat, {
      text:
        `🎲 *DADO: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
        `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
        `> 🎯 Turno: @${nextPlayer.split("@")[0]}\n` +
        `> Escribe *kocok*`,
      contextInfo: getUTContextInfo("🎲 TURNO", PLAYER_NAMES[nextTurn], [
        nextPlayer,
      ]),
    });
  }

  return true;
}

export { pluginConfig as config, handler, answerHandler };
