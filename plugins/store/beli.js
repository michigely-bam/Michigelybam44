import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "beli",
  alias: ["order", "pesan", "buy"],
  category: "store",
  description: "🛒 Comprar un producto y obtener un número de transacción",
  usage: ".beli <número_producto>",
  example: ".beli 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
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
      `📭 *Todavía no hay producto disponible.*

Escribe \`${m.prefix}listproduk\` para ver la lista de productos 🛍️`,
    );
  }

  const args = m.text?.trim().split(/\s+/) || [];
  const idx = parseInt(args[0]) - 1;

  if (isNaN(idx) || idx < 0 || idx >= products.length) {
    let txt = `🛒 *Seleccione el producto*

Escribe \`${m.prefix}beli <número>\` para pedirlo.

`;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const typeIcon = p.type === "fisik" ? "📦" : "🔑";
      const isAvailable =
        p.type === "fisik"
          ? p.stock > 0 || p.stock === -1
          : p.stockItems?.length > 0 || p.stock === -1;
      txt += `${typeIcon} *${i + 1}.* ${p.name} — ${formatPrice(p.price)} ${isAvailable ? "✅" : "❌"}\n`;
    }
    return m.reply(txt);
  }

  const product = products[idx];
  const typeIcon = product.type === "fisik" ? "📦" : "🔑";
  const typeLabel = product.type === "fisik" ? "Físico" : "Digital";

  const isAvailable =
    product.type === "fisik"
      ? product.stock > 0 || product.stock === -1
      : product.stockItems?.length > 0 || product.stock === -1;

  if (!isAvailable) {
    return m.reply(
      `❌ *Sin existencias*

` +
        `${typeIcon} Producto *${product.name}*actualmente no está disponible 😔

` +
        `Por favor, póngase en contacto con el administrador o revise más tarde.

` +
        `_ 🙏 Vamos a reponer el stock pronto`,
    );
  }

  const transactions = db.setting("storeTransactions") || {};
  let trxCounter = db.setting("storeTrxCounter") || 0;
  trxCounter++;
  const trxId = `TRX-${String(trxCounter).padStart(3, "0")}`;
  db.setting("storeTrxCounter", trxCounter);

  transactions[trxId] = {
    trxId,
    buyerJid: m.sender,
    buyerName: m.pushName || m.sender.split("@")[0],
    purchaseChat: m.chat,
    purchaseIsGroup: m.isGroup,
    productIndex: idx,
    productId: product.id,
    productName: product.name,
    productType: product.type,
    price: product.price,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.setting("storeTransactions", transactions);

  const ownerNumbers = config.owner?.number || [];
  const ownerJid =
    ownerNumbers.length > 0
      ? `${String(ownerNumbers[0]).replace(/[^0-9]/g, "")}@s.whatsapp.net`
      : null;

  let txt = `🛒 *PROGRAMA DE MENÚ*

`;
  txt += `🧾 Número de transacción: \`${trxId}\`\n\n`;
  txt += `📦 *Detalles del pedido:*
`;
  txt += `${typeIcon} Producto: *${product.name}*\n`;
  txt += `🏷️ Tipo: *${typeLabel}*\n`;
  txt += `💰 Precio: *${formatPrice(product.price)}*\n`;
  if (product.originalPrice)
    txt += `🏷️ ~~${formatPrice(product.originalPrice)}~~\n`;
  if (product.description) txt += `📝 _${product.description}_\n`;
  txt += `\n`;

  if (product.image) {
    await sock.sendMessage(
      m.chat,
      { image: { url: product.image }, caption: txt },
      { quoted: m },
    );
  } else if (product.video) {
    await sock.sendMessage(
      m.chat,
      { video: { url: product.video }, caption: txt },
      { quoted: m },
    );
  } else {
    await m.reply(txt);
  }

  let paymentTxt = `💳 *INSTRUCCIONES DE PAGO*

`;
  paymentTxt += `1️⃣ Transferencia de *${formatPrice(product.price)}* al número de administración 💰
`;

  if (config.store?.payment?.length) {
    for (const p of config.store.payment) {
      paymentTxt += `   🏦 ${p.name}: \`${p.number}\` a.n ${p.holder}\n`;
    }
  }
  if (config.store?.qris) {
    paymentTxt += `   📱 QRIS: Disponible
`;
  }

  paymentTxt += `
Dos, después de la transferencia, envía. *prueba de pago* un administrador 📸
`;
  paymentTxt += `3 para Admin verificará y enviará datos de producto a usted ✅

`;
  paymentTxt += `🧾 Su número de transacción: \`${trxId}\`\n`;
  paymentTxt += `_Guardar este número de referencia_ 📌`;

  if (ownerJid) {
    paymentTxt += `

📞 Administrador de contacto: wa.me /${ownerJid.split("@")[0]}`;
  }

  await m.reply(paymentTxt);

  if (ownerJid) {
    const buyerNum = m.sender.split("@")[0];
    await sock.sendMessage(ownerJid, {
      text:
        `🛒 *NUEVO PEDIDO*

` +
        `🧾 TRX: \`${trxId}\`\n` +
        `👤 Compradores: *${m.pushName || buyerNum}*\n` +
        `📱 Número: \`${buyerNum}\`\n` +
        `${typeIcon} Producto: *${product.name}*\n` +
        `💰 Precio: *${formatPrice(product.price)}*\n\n` +
        `_Después de recibir la prueba de transferencia 📸, responda el mensaje del comprador y escriba \`${m.prefix}done ${trxId}\`_ ✅`,
    });
  }
}

export { pluginConfig as config, handler };
