import { fluxImage } from "../../src/scraper/seaart.js";

const pluginConfig = {
  name: "ourinbanana2",
  alias: [],
  category: "ai",
  description: "Crear una imagen con IA usando prompt",
  usage: ".ourinbanana2 <prompt>",
  example: ".ourinbanana2 make it anime style",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text;
  if (!prompt) {
    return m.reply(
      `🍌 *OURIN BANANA SUPER 2*\n\n` +
        `> Buat gambar dengan AI\n\n` +
        `\`Contoh: ${m.prefix}ourinbanana2 make a cat\``,
    );
  }

  m.react("🕕");

  try {
    const result = await fluxImage(prompt, "1:1");
    const imageUrl = result.url;

    m.react("✅");

    await sock.sendMedia(m.chat, imageUrl, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Se produjo un error";
    m.reply(`🍀 *Waduhh, parece que hay un pinchazo.*

${msg}

Por favor, inténtelo de nuevo más tarde, por favor no hagas spam`);
  }
}

export { pluginConfig as config, handler };
