import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "addstok",
  alias: ["addstock", "importstok", "importstock"],
  category: "store",
  description: "📦 Añadir artículo de stock al producto (sólo chat privado)",
  usage: ".addstok <número_producto>|<detalle> o .addstok <número_producto> <cantidad>",
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
      `🚫 *Debido de acceso*

` +
        `Para mantener la privacidad de los datos de existencias 🛡️, la adición de existencias solo se puede hacer en el chat privado **.

` +
        `Por favor chatear bot en vivo 📱`,
    );
  }

  const db = getDatabase();
  const products = db.setting("storeProducts") || [];

  if (products.length === 0) {
    return m.reply(
      `📭 *Aún no hay producto.*

Añadir el producto primero: \`${m.prefix}addproduk\` ➕`,
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
            `📦 *EXISTENCIAS FÍSICO AÑADIDO*

` +
              `🏷️ Producto: *${product.name}*\n` +
              `➕ Añadido: *${addCount} unidades*\n` +
              `📊 Total de existencias: *${product.stock} unidades*\n\n` +
              `_Además:${m.prefix}addstok ${productNo + 1} <cantidad`,
          );
        }

        return m.reply(
          `📦 *SE AÑADE EL EXISTENCIAS FÍSICO*

` +
            `El producto *${product.name}* es de tipo **Físico** 📦

` +
            `Formato: \`${m.prefix}addstok ${productNo + 1} <cantidad>\`

` +
            `📝 *Ejemplo:*\n` +
            `\`${m.prefix}addstok ${productNo + 1} 8\` — Añadir 8 unidades

` +
            `Existencias actuales: *${product.stock === -1 ? "♾️ Ilimitadas" : product.stock + " unidades"}*`,
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
              `❌ *Demasiados artículos.* Un máximo de 1.000 por importación 📄`,
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
            `✅ *LA IMPORTACIÓN DE EXISTENCIAS TERMINADA*

` +
              `🏷️ Producto: *${product.name}*\n` +
              `➕ Añadido: *${added}* cuenta 🔑
` +
              (skipped > 0 ? `⏭️ Duplicados omitidos: *${skipped}*\n` : "") +
              `
📊 Total de las existencias: *${product.stockItems.length}* cuenta

` +
              `_Véase la lista de existencias: \`${m.prefix}liststok ${productNo + 1}\`_`,
          );
        }
      }
    }

    return m.reply(
      `📦 *SE AÑADE EL EXISTENCIAS*

` +
        `🔑 *Productos Digitales* — Agrega datos de cuentas/key:
` +
        `\`${m.prefix}addstok <número_producto>|<detalle>\`\n\n` +
        `📄 *Importación de los archivos .txt:*
` +
        `\`${m.prefix}addstok <número_producto>\` (responde con un archivo .txt)

` +
        `📦 *Productos físicos* — Aumenta el número de existencias:
` +
        `\`${m.prefix}addstok <número_producto> <cantidad>\`\n\n` +
        `📝 *Ejemplo digital:*\n` +
        `\`${m.prefix}addstok 1|Email: user@mail.com;;Password: pass123\`\n\n` +
        `📝 *Ejemplo de producto físico:*
` +
        `\`${m.prefix}addstok 2 8\` — Agrega 8 unidades al producto #2

` +
        `• Utilice \`;;\` para nuevas líneas en detalle 🔑
` +
        `• Cada línea en el archivo .txt = 1 existencias de elementos 📄
` +
        `• Máximo de 1.000 artículos por importación 📊

` +
        `_Los datos de las existencias digitales son confidenciales 🔒 y solo se envían a los compradores después de que se confirme el pago_`,
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
        `📦 *Este producto es de tipo Físico*

` +
          `Utilice el formato: \`${m.prefix}addstok ${productNo + 1} <cantidad>\`

` +
          `📝 Ejemplo: \`${m.prefix}addstok ${productNo + 1} 8\` — Añadir 8 unidades`,
      );
    }
    product.stock = (product.stock === -1 ? 0 : product.stock) + addCount;
    db.setting("storeProducts", products);
    await m.react("✅");
    return m.reply(
      `📦 *EXISTENCIAS FÍSICO AÑADIDO*

` +
        `🏷️ Producto: *${product.name}*\n` +
        `➕ Añadido: *${addCount} unidades*\n` +
        `📊 Total de existencias: *${product.stock} unidades*`,
    );
  }

  if (!detail || detail.length < 3) {
    return m.reply(
      `❌ *Los detalles del existencias son demasiado cortos.*

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
    `✅ *EXISTENCIAS SE AÑADIÓ*

` +
      `🏷️ Producto: *${product.name}*\n` +
      `🔑 Total de las existencias actuales: *${product.stockItems.length}* cuenta

` +
      `_Además:${m.prefix}addstok ${productNo + 1}|<detail>\`_`,
  );
}

export { pluginConfig as config, handler };
