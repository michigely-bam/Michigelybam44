const pluginConfig = {
  name: "cekmesum",
  alias: ["mesum"],
  category: "cek",
  description: "Mira lo sucio que estás.",
  usage: ".cekmesum [@usuario]",
  example: ".cekmesum Budi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const percent = Math.floor(Math.random() * 101);
  const mentioned = m.mentionedJid[0] || m.sender;

  let desc = "";
  if (percent >= 90) {
    desc = "¡PICARDÍA EXTREMA! ¡Compórtate! 😳🔞";
  } else if (percent >= 70) {
    desc = "¡Muy pícaro/a! 👀";
  } else if (percent >= 50) {
    desc = "Bastante pícaro/a 😏";
  } else if (percent >= 30) {
    desc = "Un poco pervertido/a 🙈";
  } else {
    desc = "¡Inocente y angelical! 😇";
  }

  let txt = mentioned === m.sender
    ? `Hola @${mentioned.split('@')[0]}

Tu nivel de picardía es del *${percent}%*.
\`\`\`${desc}\`\`\``
    : `Nivel de picardía de @${mentioned.split('@')[0]}: *${percent}%*.
\`\`\`${desc}\`\`\``;

  await m.reply(txt, { mentions: [mentioned] });
}

export { pluginConfig as config, handler };
