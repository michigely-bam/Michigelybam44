import fs from "fs";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";
const pluginConfig = {
  name: "brat",
  alias: ["bratmenu", "bratimg", "brattext"],
  category: "sticker",
  description: "Menú de variantes y generador de stickers Brat",
  usage: ".brat | .bratimg <texto>",
  example: ".bratimg Hola a todos",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const BRAT_VARIANTS = [
  {
    title: "Brat predeterminado",
    description: "Sticker Brat normal",
    command: "bratimg",
  },
  {
    title: "Brat verde",
    description: "Variante Brat de color verde",
    command: "bratgreen",
  },
  {
    title: "Brat blanco",
    description: "Variante Brat de color blanco",
    command: "bratwhite",
  },
  {
    title: "Brat Anime",
    description: "Variante Brat de anime",
    command: "bratanime",
  },
  {
    title: "Brat para chica",
    description: "Variante Brat para chica",
    command: "bratcewek",
  },
  {
    title: "Brat Bahlil",
    description: "Variante Brat Bahlil",
    command: "bratbahlil",
  },
  {
    title: "Brat Patrick",
    description: "Variante Brat Patrick",
    command: "bratpatrick",
  },
  {
    title: "Brat Squidward",
    description: "Variante Brat Squidward",
    command: "bratsquidward",
  },
  {
    title: "Brat Vermeil",
    description: "Variante Brat Vermeil",
    command: "bratvermeil",
  },
  { title: "Brat HD", description: "Variante Brat HD", command: "brathd" },
  {
    title: "Brat Video",
    description: "Sticker Brat animado",
    command: "bratvid",
  },
  {
    title: "Brat Video V2",
    description: "Sticker Brat de video V2",
    command: "bratvid2",
  },
  {
    title: "Kanna Brat",
    description: "Variante Brat Kanna",
    command: "kannabrat",
  },
];

function buildVariantRows(prefix, text) {
  return BRAT_VARIANTS.map((item) => ({
    title: item.title,
    description: `${item.description} • .${item.command} <texto>`,
    id: `${prefix}${item.command} ${text}`,
  }));
}

async function sendBratMenu(m, sock, text) {
  const caption =
    "🌿 *¿Quieres crear un sticker Brat? Elige una variante.*";
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌾 Elegir variante",
        sections: [
          {
            title: "Variantes Brat",
            rows: buildVariantRows(m.prefix, text),
          },
        ],
      }),
    },
  ];

  await sock.sendButton(
    m.chat,
    fs.readFileSync("./assets/images/ourin.jpg"),
    caption,
    m,
    {
      buttons,
      footer: "Elige tu variedad favorita.",
    },
  );
}

async function handler(m, { sock }) {
  const text = m.text;
  const command = String(m.command || "").toLowerCase();

  if (command === "brat") {
    await sendBratMenu(m, sock, text);
    return;
  }

  if (!text) {
    return m.reply(
      `🖼️ *ʙʀᴀᴛ ɪᴍᴀɢᴇ*

> Escriba texto

\`Ejemplo: ${m.prefix}Hermano Hi todos\``,
    );
  }

  m.react("🕕");

  try {
    const url = ourinApi.yupra.url("/api/image/brat", { text });
    await sock.sendImageAsSticker(m.chat, url, m, {
      packname: config.sticker.packname,
      author: config.sticker.author,
    });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
