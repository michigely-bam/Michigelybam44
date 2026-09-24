import config from "../../config.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import pkg from "ourin";
const { generateWAMessageFromContent, proto } = pkg;
const pluginConfig = {
  name: "setreply",
  alias: ["replyvariant", "replystyle"],
  category: "owner",
  description: "Configura la variante visual de las respuestas",
  usage: ".setreply <v1-v10>",
  example: ".setreply v5",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "Simple",
    desc: "Responder a un texto ordinario sin estilos",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Context",
    desc: "Responder con externamente AdReply (pequeña miniatura)",
    emoji: "🖼️",
  },
  v3: {
    id: 3,
    name: "Forward",
    desc: "Full contextInfo + forwardedNewsletter",
    emoji: "📨",
  },
  v4: {
    id: 4,
    name: "Qkontak",
    desc: "V3 + fake quoted reply (marca azul)",
    emoji: "✅",
  },
  v5: {
    id: 5,
    name: "FakeTroli",
    desc: "V3 + faketroli quoted + large thumbnail",
    emoji: "🛒",
  },
  v6: { id: 6, name: "Hehe", desc: "Marca azul + document", emoji: "📄" },
  v7: { id: 7, name: "Mi favorito", desc: "Marca azul + imagen", emoji: "📄" },
  v8: {
    id: 8,
    name: "Imagen alargada, sin marca azul",
    desc: "Imagen alargada, sin marca azul",
    emoji: "📄",
  },
  v9: {
    id: 9,
    name: "Video GIF",
    desc: "Video GIF sin marca azul",
    emoji: "📄",
  },
  v10: {
    id: 10,
    name: "LinkPreview",
    desc: "sendPreview + fake quoted (marca azul)",
    emoji: "🔗",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = args[0]?.toLowerCase();

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ Variedad inválida!

Uso: v1 s / d v10`);
      return;
    }

    db.setting("replyVariant", selected.id);

    await m.reply(
      `✅ *ʀᴇᴘʟʏ ᴠᴀʀɪᴀɴᴛ CAMBIADO*\n\n` +
        `> ${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `> _${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("replyVariant") || config.ui?.replyVariant || 1;

  const rows = Object.entries(VARIANTS).map(([key, val]) => ({
    title: `${val.emoji} ${key.toUpperCase()}${val.id === current ? " ✓" : ""} — ${val.name}`,
    description: val.desc,
    id: `${m.prefix}setreply ${key}`,
  }));

  const bodyText =
    `💬 *sᴇᴛ ʀᴇᴘʟʏ ᴠᴀʀɪᴀɴᴛ*\n\n` +
    `> Variante activa: *V${current}*\n` +
    `> _${VARIANTS[`v${current}`]?.name || "Desconocido"}_\n\n` +
    `> Elige una variante de la lista siguiente`;

  try {
    const interactiveButtons = [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "💬 ELEGIR VARIANTE",
          sections: [
            {
              title: "LISTA DE VARIANTES DE RESPUESTA",
              rows,
            },
          ],
        }),
      },
    ];

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: bodyText,
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: config.bot?.name || "Ourin-AI",
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: "💬 Reply Variant",
                subtitle: `${Object.keys(VARIANTS).length} variantes disponibles`,
                hasMediaAttachment: false,
              }),
              nativeFlowMessage:
                proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                  buttons: interactiveButtons,
                }),
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid:
                    config.saluran?.id || "120363400911374213@newsletter",
                  newsletterName:
                    config.saluran?.name || config.bot?.name || "Ourin-AI",
                  serverMessageId: 127,
                },
              },
            }),
          },
        },
      },
      { userJid: m.sender, quoted: m },
    );

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch {
    let txt = `💬 *sᴇᴛ ʀᴇᴘʟʏ ᴠᴀʀɪᴀɴᴛ*\n\n`;
    txt += `> Variante actual: *V${current}*\n\n`;
    for (const [key, val] of Object.entries(VARIANTS)) {
      const mark = val.id === current ? " ✓" : "";
      txt += `> ${val.emoji} *${key.toUpperCase()}*${mark} — _${val.desc}_\n`;
    }
    txt += `
_Uso: \`.setreply v1\` s/d \`.setreply v10\`_`;
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
