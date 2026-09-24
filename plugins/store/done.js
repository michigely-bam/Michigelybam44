import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "done",
  alias: ["selesai", "kirim", "confirm"],
  category: "store",
  description:
    "✅ Confirme la transacción completada y envíe los datos al comprador (replique el mensaje del comprador)",
  usage: ".done <número_transacción> (responde al mensaje del comprador)",
  example: ".done TRX-001",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatPrice(n) {
  return "Rp " + n.toLocaleString("id-ID");
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const trxId = m.text?.trim();

  if (!trxId) {
    return m.reply(
      `✅ *CONFIRMACIÓN DE LA TRANSACCIÓN*

` +
        `📋 Formato: \`${m.prefix}done <número_transacción>\`\n\n` +
        `📌 *Modo de uso:*
` +
        `1️⃣ Respuesta a los mensajes de los compradores (que ya pagaron 💰)
` +
        `2️⃣ Escriba \`${m.prefix}done TRX-001\`\n\n` +
        `🤖 El bot hará automáticamente lo siguiente:
` +
        `• Enviar los datos del producto al número de comprador 📤
` +
        `• Marcar las transacciones como completadas ✅
` +
        `• Enviar notificaciones a los compradores 🔔

` +
        `🧾 *Número de transacción* se obtiene cuando el comprador usa \`${m.prefix}beli <número_producto>\`\n\n` +
        `⚠️ _Asegúrese de que ha recibido la prueba de pago antes de la confirmación_ 📸`,
    );
  }

  const transactions = db.setting("storeTransactions") || {};
  const trx = transactions[trxId];

  if (!trx) {
    const allTrx = Object.values(transactions);
    const pending = allTrx.filter((t) => t.status === "pending");

    if (pending.length > 0) {
      let txt = `❌ *Transacción \`${trxId}\` No se encuentra.*

`;
      txt += `⏳ *Transacciones pendientes actuales:*

`;
      for (const t of pending) {
        const typeIcon = t.productType === "fisik" ? "📦" : "🔑";
        const time = new Date(t.createdAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        });
        txt += `• 🧾 \`${t.trxId}\` — ${typeIcon} ${t.productName} (${formatPrice(t.price)}) por ${t.buyerName}\n`;
        txt += `  🕐 _${time}_\n\n`;
      }
      txt += `📌 Responder mensaje el comprador y el tipo: \`${m.prefix}Número de_trx>\``;
      return m.reply(txt);
    }

    return m.reply(
      `❌ *Transacción \`${trxId}\` no encontrado.*

` +
        `📭 No hay transacciones pendientes en este momento.

` +
        `_El comprador puede hacer un pedido con \`${m.prefix}beli <número_producto>\`_ 🛒`,
    );
  }

  if (trx.status === "completed") {
    return m.reply(
      `⚠️ *La transacción ha sido concluida.*

` +
        `🧾 TRX: \`${trxId}\`\n` +
        `${trx.productType === "fisik" ? "📦" : "🔑"} Producto: *${trx.productName}*\n` +
        `👤 Compradores: ${trx.buyerName}\n` +
        `✅ Terminó en: ${new Date(trx.completedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}\n\n` +
        `_Esta transacción ha sido confirmada previamente_ 🔒`,
    );
  }

  let buyerJid = trx.buyerJid;

  if (m.quoted && m.isGroup) {
    const quotedSender = m.quoted.sender || m.quotedSender;
    if (quotedSender && quotedSender !== m.sender) {
      buyerJid = quotedSender;
    }
  }

  if (!buyerJid) {
    return m.reply(
      `❌ *No pude encontrar el número del comprador.*

Esta transacción no tiene datos de comprador válidos 📱`,
    );
  }

  const buyerNum = buyerJid.split("@")[0];
  const products = db.setting("storeProducts") || [];
  const productIdx = products.findIndex((p) => p.id === trx.productId);
  const product = productIdx !== -1 ? products[productIdx] : null;

  let stockItemDetail = null;

  if (product && trx.productType !== "fisik") {
    if (product.stockItems?.length > 0) {
      const item = product.stockItems.shift();
      stockItemDetail = item.detail;
      product.stock = product.stockItems.length;
      db.setting("storeProducts", products);
    } else if (product?.detail) {
      stockItemDetail = product.detail;
    }
  }

  if (product && trx.productType === "fisik") {
    if (product.stock !== -1 && product.stock > 0) {
      product.stock -= 1;
      db.setting("storeProducts", products);
    }
  }

  trx.status = "completed";
  trx.completedAt = new Date().toISOString();
  trx.buyerJid = buyerJid;
  trx.stockItemDetail = stockItemDetail;
  transactions[trxId] = trx;
  db.setting("storeTransactions", transactions);

  const now = new Date();
  const timeStr = now.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Ourin-AI";

  const typeIcon = trx.productType === "fisik" ? "📦" : "🔑";
  const typeLabel = trx.productType === "fisik" ? "Físico" : "Digital";

  let invoiceTxt = `🎉 *DEVICE TRANSLATICO*

`;
  invoiceTxt += `🕐 Tiempo: \`${timeStr}\`\n`;
  invoiceTxt += `✅ Estado: *Completado*

`;
  invoiceTxt += `📦 *Detalles del pedido:*
`;
  invoiceTxt += `${typeIcon} Producto: *${trx.productName}*\n`;
  invoiceTxt += `🏷️ Tipo: *${typeLabel}*\n`;
  invoiceTxt += `💰 Precio: *${formatPrice(trx.price)}*\n\n`;

  if (stockItemDetail) {
    invoiceTxt += `🔑 *Datos del producto:*
\`\`\`
${stockItemDetail}\n\`\`\`\n\n`;
    invoiceTxt += `⚠️ _Guarde los datos arriba correctamente. No comparta con nadie_ 🔒

`;
  } else if (trx.productType === "fisik") {
    invoiceTxt += `📦 _El producto físico será enviado por admin. Por favor, confirme la dirección de entrega._

`;
  }

  invoiceTxt += `🙏 ¡Gracias por tu compra! _Next order ya_ ✨`;

  try {
    await sock.sendMessage(buyerJid, {
      text: invoiceTxt,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    });
  } catch (e) {
    console.error("[Done] No se pudo enviar el mensaje al comprador:", buyerJid, e.message);
    await m.reply(
      `❌ *Falló en enviar al comprador.*

📱 Número: \`${buyerNum}\`

_Los posibles compradores no han guardado el número del bot. Envíe el siguiente manual de datos:_

${invoiceTxt}`,
    );
  }

  if (trx.purchaseIsGroup && trx.purchaseChat) {
    try {
      const buyerMention = `@${buyerNum}`;
      await sock.sendMessage(trx.purchaseChat, {
        text:
          `🎉 ¡La orden está terminada!

` +
          `${buyerMention} su compra para *${trx.productName}*ya se ha confirmado ✅
` +
          `💰 Precio: *${formatPrice(trx.price)}*\n\n` +
          `📦 Los datos del producto han sido enviados a su chat privado. ¡Echa un vistazo a los mensajes del bot! 📱

` +
          `🙏 ¡Gracias por tu compra!`,
        mentions: [buyerJid],
      });
    } catch (e) {
      console.error(
        "[Done] No se pudo notificar al grupo:",
        trx.purchaseChat,
        e.message,
      );
    }
  }

  await m.react("✅");

  let confirmTxt = `✅ *TRANSACCIÓN CONFIRMADA*

`;
  confirmTxt += `🧾 TRX: \`${trxId}\`\n`;
  confirmTxt += `${typeIcon} Producto: *${trx.productName}*\n`;
  confirmTxt += `👤 Compradores: *${trx.buyerName}*\n`;
  confirmTxt += `📱 Número: \`${buyerNum}\`\n`;
  confirmTxt += `💰 Precio: *${formatPrice(trx.price)}*\n`;
  if (product) {
    const stockDisplay =
      product.type === "fisik"
        ? `${product.stock === -1 ? "♾️ Ilimitadas" : product.stock + " unidades"}`
        : `${product.stockItems?.length || 0} cuenta`;
    confirmTxt += `📊 Existencias restantes: *${stockDisplay}*\n`;
  }
  confirmTxt += `
📤 _Los datos han sido enviados al número del comprador_ ✅`;

  return m.reply(confirmTxt);
}

export { pluginConfig as config, handler };
