import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "hapusproduk",
  alias: ["delproduk", "delproduct", "deleteproduk"],
  category: "store",
  description: "🗑️ Quitar el producto de la tienda",
  usage: ".hapusproduk <número>",
  example: ".hapusproduk 1",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `📭 *Aún no hay producto.*

Añadir el producto primero con \`${m.prefix}addproduk\` ➕`,
    );
  }

  const idx = parseInt(m.text?.trim()) - 1;

  if (isNaN(idx) || idx < 0 || idx >= products.length) {
    let txt = `🗑️ *Seleccione el producto eliminado*

Escribe \`${m.prefix}Eliminar el producto  Delete número\`

`;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const typeIcon = p.type === "fisik" ? "📦" : "🔑";
      const stockDisplay =
        p.type === "fisik"
          ? p.stock === -1
            ? "♾️"
            : `${p.stock} unidades`
          : `${p.stockItems?.length || 0} cuenta`;
      txt += `${typeIcon} *${i + 1}.* ${p.name} — Rp ${p.price.toLocaleString("id-ID")} (${stockDisplay})\n`;
    }
    return m.reply(txt);
  }

  const deleted = products.splice(idx, 1)[0];
  db.setting("storeProducts", products);

  const typeIcon = deleted.type === "fisik" ? "📦" : "🔑";

  await m.react("✅");
  return m.reply(
    `🗑️ *PRODUCTOS ELIMINADOS*

` +
      `${typeIcon} Nombre: *${deleted.name}*\n` +
      `💰 Precio: *Rp ${deleted.price.toLocaleString("id-ID")}*\n` +
      `📊 Existencias eliminadas: *${deleted.type === "fisik" ? deleted.stock + " unidades" : (deleted.stockItems?.length || 0) + " cuentas"}*\n\n` +
      `⚠️ _Los productos han sido eliminados permanentemente y no pueden ser devueltos._`,
  );
}

export { pluginConfig as config, handler };
