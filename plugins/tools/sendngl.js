import te from "../../src/lib/ourin-error.js";
import ourinApi from "../../src/lib/ourin-apimanager.js";
const pluginConfig = {
  name: "sendngl",
  alias: [],
  category: "tools",
  description: "Enviar un mensaje NGL",
  usage: ".sendngl <url> | <texto>",
  example: ".sendngl https://ngl.link/xxxx | hola",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.split("|");
  const [link, kata] = text;
  if (!link)
    return m.reply(
      `*¿DÓNDE ESTÁ EL ENLACE DE NGL?*
Ejemplo: \`${m?.prefix}sendngl https://ngl.link/xxxx | hola`,
    );
  if (!kata)
    return m.reply(
      `*FALTA EL MENSAJE*

Ejemplo: \`${m?.prefix}sendngl https://ngl.link/xxxx | hola`,
    );
  m.react("🎴");

  try {
    await ourinApi.cuki.sendNgl(
      {
        link,
        text: kata,
      },
      {
        timeout: 30000,
      },
    );

    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text: `✅ *DONE*

¡Ha sido un éxito enviando un mensaje!
Target: ${link}
Mensaje: ${kata}`,
      },
      { quoted: m },
    );
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
