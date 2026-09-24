const pluginConfig = {
  name: ["buatsaluran", "createsaluran", "createnewsletter"],
  alias: [],
  category: "owner",
  description: "Crear un nuevo canal / nuevo",
  usage: ".buatsaluran <nombre>|<descripción>",
  example: ".buatsaluran Info Bot|Última actualización de nuestro bot",
  isOwner: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim() || "";
  const pipeIdx = text.indexOf("|");

  let name, description;
  if (pipeIdx === -1) {
    name = text;
    description = "";
  } else {
    name = text.substring(0, pipeIdx).trim();
    description = text.substring(pipeIdx + 1).trim();
  }

  if (!name || name.length < 2) {
    return m.reply(
      "📢 *para el canal*\n\n" +
        "> `.buatsaluran Nama Saluran`\n" +
        "> `.buatsaluran Nama|Deskripsi`\n\n" +
        "📝 Ejemplo:\n" +
        "> `.buatsaluran Info Bot`\n" +
        "> `.buatsaluran Info Bot|Última actualización de nuestro bot`",
    );
  }

  try {
    const result = await sock.newsletterCreate(name, description || undefined);
    const saluranId = result?.id || result?.thread_metadata?.id || "unknown";
    const saluranName = result?.name || name;
    await m.react("✅");
    return m.reply(
      `📢 *canales hechos*

` +
        `> Nombre: ${saluranName}\n` +
        (description ? `> Descripción: ${description}\n` : "") +
        `> ID: ${saluranId}\n` +
        `> Subscribers: ${result?.subscribers || 0}\n\n` +
        `_Este canal se puede configurar en config.channel.id_`,
    );
  } catch (err) {
    return m.reply(`❌ No se pudo create channel: ${err.message}`);
  }
}

export { pluginConfig as config, handler };
