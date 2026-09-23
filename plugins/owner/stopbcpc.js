const pluginConfig = {
  name: 'stopbcpc',
  alias: ['stopbroadcastpc'],
  category: 'owner',
  description: "Dejar de ejecutar la emisión privada",
  usage: '.stopbcpc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcpc) {
    return m.reply("❌ No se está ejecutando ninguna transmisión privada.")
  }
  global.stopBcpc = true
  return m.reply('⏹️ Menghentikan broadcast private...')
}

export { pluginConfig as config, handler }
