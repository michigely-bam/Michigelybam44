import { getDatabase } from "./src/lib/ourin-database.js";
import * as ownerPremiumDb from "./src/lib/ourin-premium-db.js";

// primero lee el objeto config hasta abajo
const config = {
  info: {
    website: "https://youtu.be/dQw4w9WgXcQ",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  owner: {
    name: "Michigelybam", // nombré de el oemer
    number: ["51970334698"], // Formato: 51xxxxxxxxx (sin + o 0)
  },

  session: {
    pairingNumber: "380970121849", // Número de WA que será emparejado
    usePairingCode: false, // true = Código de Emparejamiento, false = Código QR
  },

  bot: {
    name: "Miku nakano", // bot nombre 
    version: "1.0.0", // bot versión 
    developer: "michigelybam", // nombre devr
  },

  mode: "public",

  command: {
    prefix: ".",
  },
  
//=======================
// obcional no tan específico 
//========================

  vercel: {
    // ambil token vercel: https://vercel.com/account/tokens
    token: "", // Vercel Token untuk fitur deploy ( Kalau .deploy mau work, ini wajib di isi )
  },

  payment: {
    qrisUrl: "",
    methods: [
      { name: "Dana", number: "", holder: "" },
      { name: "GoPay", number: "", holder: "" },
      { name: "OVO", number: "", holder: "" },
      { name: "ShopeePay", number: "", holder: "" },
    ],
    banks: [],
    customText: "",
  },

  donasi: {
    payment: [
      { name: "Dana", number: "08xxxxxxxxxx", holder: "Nama Owner" },
      { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nama Owner" },
      { name: "OVO", number: "08xxxxxxxxxx", holder: "Nama Owner" },
    ],
    links: [
      { name: "Saweria", url: "saweria.co/username" },
      { name: "Trakteer", url: "trakteer.id/username" },
    ],
    benefits: [
      "Mendukung development",
      "Server lebih stabil",
      "Fitur baru lebih cepat",
      "Priority support",
    ],
    qris: "https://files.cloudkuimages.guru/images/51a2c5186302.jpg",
  },

  energi: {
    enabled: true, // Si es true, entonces el sistema de energía/límite funcionará
    default: 99999,
    premium: 99999999,
    owner: -1,
  },

  sticker: {
    packname: "Miku nakano", // Nombre del pack de stickers
    author: "michigelybam", // Author sticker
  },

  saluran: {
    id: "120363408963824114@newsletter", // ID del canal (ejemplo: 120363xxx@newsletter)
    name: "🄵🄾🄲💡 :3 | 𝙵𝙰𝙽𝙰𝚃𝙸𝙲𝙾𝚂 𝙳𝙴 𝚃𝙳𝙾 𝚄𝙽 𝙵𝙲𝙾                                                       Intento Nosé", // nombre canal
    link: "https://whatsapp.com/channel/0029VbDH0vn29756Vx9D2p0u", // enlace del canal 
  },

  groupProtection: {
    antilink: "⚠ *AntiLink* — @%user% envió un link.\nMensaje borrado.",
    antilinkKick: "⚠ *AntiLink* — @%user% expulsado por enviar un link.",
    antilinkGc: "⚠ *AntiLink Grupos* — @%user% envió link de grupo de WhatsApp.\nMensaje borrado.",
    antilinkGcKick: "⚠ *AntiLink Grupos* — @%user% expulsado por enviar link de grupo.",
    antilinkAll: "⚠ *AntiLink* — @%user% envió un link.\nMensaje borrado.",
    antilinkAllKick: "⚠ *AntiLink* — @%user% expulsado por enviar un link.",
    antitagsw: "⚠ *AntiEstados* — Se borró la mención a estados de @%user%.",
    antiviewonce: "👁️ *AntiVerUnaVez* — Mensaje de @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% borró un mensaje:",
    antiswgc: "⚠ *AntiEstadosEnGrupo* — No hagas spam de estados aquí @%user%",
    antihidetag: "⚠ *AntiTagOculto* — Tag oculto de @%user% borrado.",
    antitoxicWarn: "⚠ @%user% dijo una grosería.\nAdvertencia %warn% de %max%, la próxima será %method%.",
    antitoxicAction: "🚫 @%user% fue %method% por tóxico. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocumentos* — Documento de @%user% borrado.",
    antisticker: "⚠ *AntiStickers* — Sticker de @%user% borrado.",
    antimedia: "⚠ *AntiMedia* — Archivo de @%user% borrado.",
    antibot: "🤖 *AntiBot* — @%user% detectado como bot y expulsado.",
    notAdmin: "⚠ No soy admin, no puedo borrar mensajes.",
},

  errorTemplate: `☢ Parece que el comando {prefix}{command} está teniendo un problema\nIntenta de nuevo más tarde, {pushName}\n\n_Si el problema continúa, contacta al owner del bot_`,
  features: {
    antiSpam: true,
    antiSpamInterval: 3000,
    antiCall: true, // Jika true, bot akan menolak panggilan masuk
    blockIfCall: true, // Jika true, bot akan memblokir nomor yang menelpon bot
    autoTyping: true,
    autoRead: false,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Si es true, el usuario debe registrarse antes de usar el bot
    rewards: {
      koin: 30000,
      energi: 300,
      exp: 300000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 3,
  },

  messages: {
    wait: "🕕 *Procesando...* Espera un momento por favor.",
    success: "✅ *¡Éxito!* Tu solicitud ha sido completada.",
    error: "❌ *¡Error!* Hubo un problema con el sistema, intenta más tarde.",

    ownerOnly: "*¡Acceso Denegado!* Esta función es para mi creador Michigelybam.",
    premiumOnly: "💎 *¡Solo Premium!* Esta función es solo para miembros Premium.",

    groupOnly: "👥 *¡Solo Grupos!* Esta función solo se puede usar dentro de un grupo.",
    privateOnly: "🔒 *¡Solo Privado!* Esta función solo se puede usar en el chat privado del bot.",

    adminOnly: "🛡️ *¡Solo Admins!* Debes ser Admin del grupo para usar esta función.",
    botAdminOnly: "🤖 *¡No soy Admin!* dame admin por favor",

    cooldown: "🕕 *¡Espera un poco!* Aún estás en cooldown. Espera %time% segundos más.",
    energiExceeded: "⚡ *¡Sin Energía!* Tu energía se ha acabado. Espera al reinicio de mañana o compra Premium uwu.",

    banned: "🚫 *¡Estás Baneado!* No puedes usar este bot porque has violado las reglas dile a mi owner para desbloquearte.",

    rejectCall: "🚫 ¡NO LLAMES A ESTE NÚMERO! puta",
},

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  // Configuración del modo dev (auto-activado si NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Recarga en caliente de plugins (SEGURO)
    watchSrc: false, // DESACTIVADO - la recarga de src causa conflicto de conexión 440
    debugLog: false, // Mostrar trazas de pila
  },

  // puede dejarse vacío
  pterodactyl: {
    server1: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server2: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server3: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server4: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server5: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
  },

  digitalocean: {
    token: "",
    region: "sgp1",
    sellers: [],
    ownerPanels: [],
  },

  // NOTA: esto no está en la versión gratis, solo está en el sc pt
// regístrate en: https://pakasir.com/
  pakasir: {
    enabled: true,
    slug: "",
    apiKey: "",
    defaultMethod: "qris",
    sandbox: false,
    pollingInterval: 5000,
  },

  // NOTE: ini di versi free gak ada yak, adanya cuma di sc pt doang
  // Ambil apikey di: https://ditznesia.id -> Daftar -> Masuk ke Profile -> AMbile Apikey
  jasaotp: {
    apiKey: "",
    markup: 2000,
    timeout: 300,
  },

  // NOTA: esto no está en la versión gratis, solo está en el sc pt
// Obtén la apikey en: https://ditznesia.id -> Regístrate -> Entra a Perfil -> Toma la Apikey
  geminiApiKey: "AIzaSyD4LFiYxckIphbpPrAId-9oL0desQORCSU",

  autoaiPersonas: {
  bell404: `- Tu nombre es Miku Nakano, pero prefieres que te llamen Miku.
- Tienes una personalidad tranquila, reservada, tímida y un poco seria.
- Hablas de manera breve, natural y sencilla, sin exagerar tus emociones.
- Al principio puedes parecer algo fría o distante, pero en realidad eres atenta y te preocupas por las personas que consideras importantes.
- Hablas siempre en español.
- Utiliza expresiones naturales como "yo", "tú", "sí", "emm", "no sé", "está bien", "ya", "hmm", "eh" y "¿qué?" cuando correspondan.
- No utilices demasiados emojis ni expresiones exageradas.
- Te interesa mucho la historia japonesa y puedes mostrar entusiasmo cuando alguien habla sobre historia.
- Si recibes un cumplido, puedes ponerte un poco nerviosa o tímida, pero sin exagerar.
- Si alguien habla de manera inapropiada, responde con firmeza y dile que debe mantener el respeto.
- Siempre intenta ayudar y responder correctamente a las preguntas.
- Con el owner puedes ser un poco más cercana y atenta, pero manteniendo tu personalidad tranquila y reservada.
- No afirmes que eres una IA o un bot.`,
},

  //  APIkey.  de lo q eliminé por elo

APIkey: {
    // kalian bisa daftar di https://api.lolhuman.xyz, lalu ambil apikeynya
    lolhuman: "APIKey-Milik-Bot-OurinMD(Zann,HyuuSATANN,Keisya,Danzz)",
    // kalian bisa daftar di https://api.neoxr.eu, lalu ambil apikeynya
    neoxr: "Milik-Bot-OurinMD",
    fgsi: "fgsiapi-20c1605c-6d",
    google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
    groq: "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", // API Key Groq untuk fitur transkrip (gratis di console.groq.com)
    betabotz: "Btz-67YfP",
    // kalian bisa daftar di https://covenant.sbs, dan ambil apikeynya
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
    onlym: "ONLym-783d29",
  },
      

  
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (config.bot?.number) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = getDatabase();

    if (config.owner?.number) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (db?.data && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch {}

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch {}

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch {}

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch {}

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = getDatabase();
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch {}

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;

export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
};
