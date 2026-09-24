import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "listproduk",
  alias: ["produk", "katalog", "catalog"],
  category: "store",
  description: "🛍️ Ver lista de productos disponibles",
  usage: ".listproduk",
  example: ".listproduk",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function formatPrice(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `🏪 *Productos No están disponibles*

` +
        `Actualmente no hay ningún producto añadido por el administrador 😔

` +
        `Por favor revise más tarde o comuníquese con el administrador para más información.

` +
        `_ 🙏 Gracias por su interés`,
    );
  }

  let txt = `🛍️ *LÍNEA DE PRODUCCIÓN*

`;
  txt += `Aquí están los productos disponibles hoy 🎉
`;
  txt += `Para comprar, escribe \`${m.prefix}beli <número>\`

`;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const type = p.type || "digital";
    const typeIcon = type === "digital" ? "🔑" : "📦";
    const typeLabel = type === "digital" ? "Digital" : "Físico";

    let stockDisplay;
    if (type === "digital") {
      const count = p.stockItems?.length || 0;
      stockDisplay = p.stock === -1 ? "♾️ Ilimitadas" : `${count} cuentas`;
    } else {
      stockDisplay = p.stock === -1 ? "♾️ Ilimitadas" : `${p.stock} unidades`;
    }

    const isAvailable =
      type === "digital"
        ? p.stockItems?.length > 0 || p.stock === -1
        : p.stock > 0 || p.stock === -1;
    const statusIcon = isAvailable ? "✅" : "❌";

    const priceStr = formatPrice(p.price);
    const originalPriceStr = p.originalPrice
      ? `~~${formatPrice(p.originalPrice)}~~ `
      : "";

    txt += `*${i + 1}.* ${typeIcon} ${p.name}\n`;
    txt += `   💰 ${originalPriceStr}${priceStr}\n`;
    txt += `   📊 Existencias: ${stockDisplay} ${statusIcon}\n`;
    txt += `   🏷️ Tipo: ${typeLabel}\n`;
    if (p.description)
      txt += `   📝 _${p.description.substring(0, 60)}${p.description.length > 60 ? "..." : ""}_\n`;
    txt += `\n`;
  }

  txt += `💡 Escribe \`${m.prefix}beli <número>\` para pedir un producto_`;

  if (m.isGroup) {
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";
    await sock.sendMessage(
      m.chat,
      {
        text: txt,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      },
      { quoted: m },
    );
  } else {
    await m.reply(txt);
  }
}

export { pluginConfig as config, handler };
