const pluginConfig = {
  name: 'stopbcgc',
  alias: ['stopbroadcastgc'],
  category: 'owner',
  description: "Stop broadcast running group",
  usage: '.stopbcgc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcgc) {
    return m.reply("❌ Ningún grupo de transmisión está funcionando.")
  }
  global.stopBcgc = true
  return m.reply("⏹️ Detener la transmisión del grupo...")
}

export { pluginConfig as config, handler }
