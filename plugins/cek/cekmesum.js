const pluginConfig = {
  name: "cekmesum",
  alias: ["mesum"],
  category: "cek",
  description: "Mira lo sucio que estás.",
  usage: ".cekperg - nombre identificado",
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
    desc = "MESUM AKUT! Tobat mas! 😳🔞";
  } else if (percent >= 70) {
    desc = "Mesum banget! 👀";
  } else if (percent >= 50) {
    desc = "Lumayan mesum 😏";
  } else if (percent >= 30) {
    desc = "Sedikit mesum 🙈";
  } else {
    desc = "¡Llanta y santa! 😇";
  }

  let txt =
    mentioned === m.sender
      ? `Hai @${mentioned.split("@")[0]}
    
Tus pretendientes nivel. *${percent}%*
\`\`\`${desc}\`\`\``
      : `Usted quiere comprobar el nivel de succión${mentioned.split("@")[0]} yak? 
    
Tingkat kemesuman dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``;

  await m.reply(txt, { mentions: [mentioned] });
}

export { pluginConfig as config, handler };
