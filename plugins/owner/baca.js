const pluginConfig = {
  name: ["baca", "read", "markread"],
  alias: [],
  category: "owner",
  description: "Marca un mensaje como leído",
  usage: ".baca",
  example: ".baca",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.readMessages([m.key]);
    await m.react("✅");
    return m.reply("📖 *Mensaje marcado como leído*");
  } catch (err) {
    return m.reply(`❌ Error: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
