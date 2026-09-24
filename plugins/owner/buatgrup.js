const pluginConfig = {
    name: ['buatgrup', 'creategroup', 'newgroup'],
    alias: [],
    category: 'owner',
    description: "Crear un nuevo grupo",
    usage: '.buatgrup <nombre>|<número1,número2,...>',
    example: '.buatgrup Grupo nuevo|628xxx,628yyy',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    const pipeIdx = text.indexOf('|')

    if (pipeIdx === -1) {
        return m.reply(
            '👥 *CREAR GRUPO NUEVO*\n\n' +
            '> `.buatgrup Nama Grup|628xxx,628yyy`\n\n' +
            "• Utilice `|` para separar nombres y participantes\n" +
            "• Separar el número de participantes con una coma\n" +
            "• El bot se convierte automáticamente en administrador\n\n" +
            '📝 Ejemplo:\n' +
            '> `.buatgrup Tim Alpha|628123,628456`'
        )
    }

    const name = text.substring(0, pipeIdx).trim()
    const participantsStr = text.substring(pipeIdx + 1).trim()

    if (!name || name.length < 2) {
        return m.reply("❌ El nombre del grupo es por lo menos 2 caracteres.")
    }

    const participants = participantsStr
        .split(/[,;\s]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 5)
        .map(n => n + '@s.whatsapp.net')

    if (participants.length === 0) {
        return m.reply("❌ Introduzca al menos un número de participante.")
    }

    try {
        const group = await sock.groupCreate(name, participants)
        await m.react('✅')
        return m.reply(
            `👥 *GRUPO CREADO*

` +
            `> Nombre: ${name}\n` +
            `> ID: ${group.id}\n` +
            `> Participantes: ${participants.length} personas

` +
            `_El bot se convierte automáticamente en administrador_`
        )
    } catch (err) {
        return m.reply(`❌ No se pudo create group: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
