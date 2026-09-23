import fs from "fs";
import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";
const pluginConfig = {
  name: "brat",
  alias: ["bratmenu", "bratimg", "brattext"],
  category: "sticker",
  description: "Menú de la variante de latón y generador de adhesivos",
  usage: ".brat | .bratimg <text>",
  example: ".Hermano Hi todos",
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
    title: "Brat Default",
    description: "Sticker brat versi biasa",
    command: "bratimg",
  },
  {
    title: "Brat Green",
    description: "Variant brat warna hijau",
    command: "bratgreen",
  },
  {
    title: "Brat White",
    description: "Variant brat warna putih",
    command: "bratwhite",
  },
  {
    title: "Brat Anime",
    description: "Variant brat anime",
    command: "bratanime",
  },
  {
    title: "Brat Cewek",
    description: "Variant brat cewek",
    command: "bratcewek",
  },
  {
    title: "Brat Bahlil",
    description: "Variant brat bahlil",
    command: "bratbahlil",
  },
  {
    title: "Brat Patrick",
    description: "Variant brat Patrick",
    command: "bratpatrick",
  },
  {
    title: "Brat Squidward",
    description: "Variant brat Squidward",
    command: "bratsquidward",
  },
  {
    title: "Brat Vermeil",
    description: "Variant brat Vermeil",
    command: "bratvermeil",
  },
  { title: "Brat HD", description: "Variant brat HD", command: "brathd" },
  {
    title: "Brat Video",
    description: "Sticker brat animated",
    command: "bratvid",
  },
  {
    title: "Brat Video V2",
    description: "Sticker brat video v2",
    command: "bratvid2",
  },
  {
    title: "Kanna Brat",
    description: "Variant brat Kanna",
    command: "kannabrat",
  },
];

function buildVariantRows(prefix, text) {
  return BRAT_VARIANTS.map((item) => ({
    title: item.title,
    description: `${item.description} • .${item.command} <text>`,
    id: `${prefix}${item.command} ${text}`,
  }));
}

async function sendBratMenu(m, sock, text) {
  const caption =
    "🌿 *Usted quiere crear yak de latón, por favor seleccione un rango de teclas diferente debajo*";
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🌾 Seleccione una correa variable",
        sections: [
          {
            title: "Variant Brat",
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

\`Contoh: ${m.prefix}Hermano Hi todos\``,
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
