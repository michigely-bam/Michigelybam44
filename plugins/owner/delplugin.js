import fs from "fs";
import path from "path";
import { unloadPlugin } from "../../src/lib/ourin-plugins.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "delplugin",
  alias: ["delpl", "hapusplugin", "removeplugin"],
  category: "owner",
  description: "Eliminar plugins por nombre",
  usage: ".delplugin < nombre",
  example: ".delplugin bliblidl",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function findPluginFile(pluginsDir, name) {
  const folders = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const folder of folders) {
    const folderPath = path.join(pluginsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "");
      if (baseName.toLowerCase() === name.toLowerCase()) {
        return { folder, file, path: path.join(folderPath, file) };
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = m.fullArgs?.trim() || m.args?.[0];

  if (!name) {
    return m.reply(
      `🗑️ *DEL PLUGIN*\n\n` +
        `Eliminar el plugin por nombre

` +
        `*Ejemplo:*
` +
        `\`${m.prefix}delplugin bliblidl\``,
    );
  }

  await m.react("🕕");

  try {
    const pluginsDir = path.join(process.cwd(), "plugins");
    const found = findPluginFile(pluginsDir, name);

    if (!found) {
      await m.react("❌");
      return m.reply(`❌ *FALLÓ*

Plugin \`${name}\` no encontrado`);
    }

    let unloadResult = { success: false };
    try {
      unloadResult = unloadPlugin(found.path) || { success: true };
    } catch {}

    fs.unlinkSync(found.path);

    await m.react("✅");
    return m.reply(
      `✅ *EL PLUGIN FUE ELIMINADO*

` +
        `╭─〔 *DETAIL* 〕───⬣\n` +
        `│ File: \`${found.file}\`\n` +
        `│ Folder: \`${found.folder}\`\n` +
        `│ Unload: ${unloadResult.success ? "✅ Completado" : "⚠️ Pending"}\n` +
        `╰───────⬣\n\n` +
        `¡El plugin ha sido eliminado y está inactivo!`,
    );
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
