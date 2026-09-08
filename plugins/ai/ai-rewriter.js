import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";

const configuracionPlugin = {
  name: "ai-rewriter",
  alias: ["airewriter", "rewriteai"],
  category: "ai",
  description: "Reescribe textos con un tono determinado",
  usage: ".ai-rewriter <texto> | <tono>",
  example: ".ai-rewriter hola a todos | profesional",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

function analizarEntradaReescritura(entrada) {
  const valor = String(entrada || "").trim();
  if (!valor) return { text: "", tone: "professional" };

  const partes = valor
    .split("|")
    .map((elemento) => elemento.trim())
    .filter(Boolean);

  if (partes.length === 0) {
    return { text: "", tone: "professional" };
  }

  if (partes.length === 1) {
    return {
      text: partes[0],
      tone: "professional",
    };
  }

  return {
    text: partes[0],
    tone: partes.slice(1).join(" | ") || "professional",
  };
}

async function controlador(m) {
  const analizado = analizarEntradaReescritura(m.text);

  if (!analizado.text) {
    return m.reply(
      `✍️ *REESCRITOR IA*\n\n` +
        `> Reescribe un texto con el tono que elijas\n\n` +
        `\`Ejemplo: ${m.prefix}ai-rewriter Hola a todos | professional\``,
    );
  }

  if (!config.APIkey?.covenant) {
    return m.reply("❌ La API key de Covenant no está configurada.");
  }

  m.react("🕕");

  try {
    const datos = await ourinApi.covenant.rewrite(
      {
        text: analizado.text,
        tone: analizado.tone,
      },
      {
        timeout: 30000,
      },
    );

    if (!datos?.status || !datos?.data?.result) {
      throw new Error(datos?.message || "No se pudo reescribir el texto");
    }

    m.react("✅");

    await m.reply(
      `✍️ *REESCRITOR IA*\n\n` +
        `> Tono: ${analizado.tone}\n` +
        `> Costo: ${datos?.usage?.cost ?? "-"}\n` +
        `> Créditos restantes: ${datos?.usage?.remaining ?? "-"}\n\n` +
        `${datos.data.result}`,
    );
  } catch (error) {
    m.react("☢");

    const mensaje = error?.response?.data?.message || error?.message;

    if (mensaje) {
      return m.reply(`❌ ${mensaje}`);
    }

    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { configuracionPlugin as config, controlador as handler };
