import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "addstok",
  alias: ["addstock", "importstok", "importstock"],
  category: "store",
  description: "📦 Añadir artículo de stock al producto (sólo chat privado)",
  usage:
    ".addstock − número_produk>|<detail> atau .addstok No. No.",
  example: ".addstok 1|Email: user@mail.com;;Password: pass123",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.isGroup) {
    return m.reply(
      `🚫 *Akses Ditolak*\n\n` +
        `Untuk menjaga privasi data stok 🛡️, penambahan stok hanya dapat dilakukan di *private chat*.\n\n` +
        `Silakan chat bot secara langsung 📱`,
    );
  }

  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `📭 *Aún no hay producto.*

Tambahkan produk terlebih dahulu: \`${m.prefix}addproduk\` ➕`,
    );
  }

  const text = m.text?.trim() || "";
  const pipeIdx = text.indexOf("|");

  if (pipeIdx === -1) {
    const productNo = parseInt(text.split(/\s+/)[0]) - 1;

    if (!isNaN(productNo) && productNo >= 0 && productNo < products.length) {
      const product = products[productNo];

      if (product.type === "fisik") {
        const addCount = parseInt(text.split(/\s+/)[1]);
        if (!isNaN(addCount) && addCount > 0) {
          product.stock = (product.stock === -1 ? 0 : product.stock) + addCount;
          db.setting("storeProducts", products);
          await m.react("✅");
          return m.reply(
            `📦 *STOK FISIK DITAMBAHKAN*\n\n` +
              `🏷️ Produk: *${product.name}*\n` +
              `➕ Ditambahkan: *${addCount} pcs*\n` +
              `📊 Total stok: *${product.stock} pcs*\n\n` +
              `_Tambah lagi: \`${m.prefix}addstok ${productNo + 1} <jumlah>\`_`,
          );
        }

        return m.reply(
          `📦 *TAMBAH STOK FISIK*\n\n` +
            `Produk *${product.name}* bertipe **Fisik** 📦\n\n` +
            `Format: \`${m.prefix}addstok ${productNo + 1} <jumlah>\`\n\n` +
            `📝 *Contoh:*\n` +
            `\`${m.prefix}addstok ${productNo + 1} 8\` — Tambah 8 pcs\n\n` +
            `Stok saat ini: *${product.stock === -1 ? "♾️ Unlimited" : product.stock + " pcs"}*`,
        );
      }

      if (m.quoted) {
        const quotedType = m.quoted.type || m.quoted.mtype;
        const isDocument =
          quotedType === "documentMessage" ||
          quotedType === "documentWithCaptionMessage";
        const fileName =
          m.quoted.fileName ||
          m.quoted.message?.documentMessage?.fileName ||
          "";

        if (isDocument && fileName.toLowerCase().endsWith(".txt")) {
          await m.reply(`⏳ _Procesando archivo ..._`);
          let fileBuffer;
          try {
            fileBuffer = await m.quoted.download();
          } catch {
            return m.reply(
              `❌ *No podía leer el archivo.*

Asegúrese de que los archivos no están vacíos y descargados 📄`,
            );
          }
          if (!fileBuffer || fileBuffer.length === 0)
            return m.reply(`❌ *Un archivo vacío.* 📄`);

          const fileContent = fileBuffer.toString("utf-8").trim();
          const lines = [];
          if (fileContent.includes(";;")) {
            const rawLines = fileContent
              .split(/[\n\r]+/)
              .map((l) => l.trim())
              .filter((l) => l.length > 0);
            for (const raw of rawLines) {
              const subItems = raw
                .split(/\s{2,}/)
                .map((s) => s.trim())
                .filter((s) => s.length >= 3);
              if (subItems.length > 1) lines.push(...subItems);
              else lines.push(raw);
            }
          } else {
            const tokens = fileContent
              .split(/[\s\n\r]+/)
              .map((t) => t.trim())
              .filter((t) => t.length >= 3);
            lines.push(...tokens);
          }
          if (lines.length === 0)
            return m.reply(`❌ *El archivo no contiene datos válidos.* 📄`);
          if (lines.length > 1000)
            return m.reply(
              `❌ *Terlalu banyak item.* Maksimal 1.000 per import 📄`,
            );

          if (!product.stockItems) product.stockItems = [];
          const existingDetails = new Set(
            product.stockItems.map((item) => item.detail),
          );
          let added = 0,
            skipped = 0;

          for (let i = 0; i < lines.length; i++) {
            const detail = lines[i].replace(/;;/g, "\n");
            if (detail.length < 3) continue;
            if (existingDetails.has(detail)) {
              skipped++;
              continue;
            }
            product.stockItems.push({
              id: Date.now() + i,
              detail,
              addedAt: new Date().toISOString(),
            });
            existingDetails.add(detail);
            added++;
          }

          product.stock = product.stockItems.length;
          db.setting("storeProducts", products);
          await m.react("✅");
          return m.reply(
            `✅ *IMPORT STOK SELESAI*\n\n` +
              `🏷️ Produk: *${product.name}*\n` +
              `➕ Ditambahkan: *${added}* akun 🔑\n` +
              (skipped > 0 ? `⏭️ Duplikat dilewati: *${skipped}*\n` : "") +
              `\n📊 Total stok: *${product.stockItems.length}* akun\n\n` +
              `_Lihat daftar stok: \`${m.prefix}liststok ${productNo + 1}\`_`,
          );
        }
      }
    }

    return m.reply(
      `📦 *TAMBAH STOK*\n\n` +
        `🔑 *Produk Digital* — Tambah data akun/key:\n` +
        `\`${m.prefix}addstok <nomor_produk>|<detail>\`\n\n` +
        `📄 *Import dari file .txt:*\n` +
        `\`${m.prefix}addstok <nomor_produk>\` (reply file .txt)\n\n` +
        `📦 *Produk Fisik* — Tambah jumlah stok:\n` +
        `\`${m.prefix}addstok <nomor_produk> <jumlah>\`\n\n` +
        `📝 *Contoh digital:*\n` +
        `\`${m.prefix}addstok 1|Email: user@mail.com;;Password: pass123\`\n\n` +
        `📝 *Contoh fisik:*\n` +
        `\`${m.prefix}addstok 2 8\` — Tambah 8 pcs untuk produk #2\n\n` +
        `• Gunakan \`;;\` untuk baris baru dalam detail 🔑\n` +
        `• Setiap baris di file .txt = 1 stok item 📄\n` +
        `• Maksimal 1.000 item per import 📊\n\n` +
        `_Data stok digital bersifat rahasia 🔒 dan hanya dikirim ke pembeli setelah pembayaran dikonfirmasi_`,
    );
  }

  const productNo = parseInt(text.substring(0, pipeIdx).trim()) - 1;
  const detail = text
    .substring(pipeIdx + 1)
    .trim()
    .replace(/;;/g, "\n");

  if (isNaN(productNo) || productNo < 0 || productNo >= products.length) {
    return m.reply(
      `❌ *Número de producto no válido.*

Ver lista de productos: \`${m.prefix}liststok\` 📋`,
    );
  }

  const product = products[productNo];

  if (product.type === "fisik") {
    const addCount = parseInt(detail);
    if (isNaN(addCount) || addCount <= 0) {
      return m.reply(
        `📦 *Produk ini bertipe Fisik*\n\n` +
          `Gunakan format: \`${m.prefix}addstok ${productNo + 1} <jumlah>\`\n\n` +
          `📝 Contoh: \`${m.prefix}addstok ${productNo + 1} 8\` — Tambah 8 pcs`,
      );
    }
    product.stock = (product.stock === -1 ? 0 : product.stock) + addCount;
    db.setting("storeProducts", products);
    await m.react("✅");
    return m.reply(
      `📦 *STOK FISIK DITAMBAHKAN*\n\n` +
        `🏷️ Produk: *${product.name}*\n` +
        `➕ Ditambahkan: *${addCount} pcs*\n` +
        `📊 Total stok: *${product.stock} pcs*`,
    );
  }

  if (!detail || detail.length < 3) {
    return m.reply(
      `❌ *Detail stok terlalu pendek.*

Se requieren 3 caracteres mínimos para utilizar datos de stock 🔑`,
    );
  }

  if (!product.stockItems) product.stockItems = [];

  const isDuplicate = product.stockItems.some((item) => item.detail === detail);
  if (isDuplicate) {
    return m.reply(
      `⚠️ *Los datos de stock están dentro.*

El mismo artículo en el mismo detalle ya está listado en el producto *${product.name}* 🔑`,
    );
  }

  product.stockItems.push({
    id: Date.now(),
    detail,
    addedAt: new Date().toISOString(),
  });
  product.stock = product.stockItems.length;
  db.setting("storeProducts", products);

  await m.react("✅");
  return m.reply(
    `✅ *STOK DITAMBAHKAN*\n\n` +
      `🏷️ Produk: *${product.name}*\n` +
      `🔑 Total stok saat ini: *${product.stockItems.length}* akun\n\n` +
      `_Tambah lagi: \`${m.prefix}addstok ${productNo + 1}|<detail>\`_`,
  );
}

export { pluginConfig as config, handler };
