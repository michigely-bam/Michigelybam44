import cp from "child_process";
import { promisify } from "util";

const exec = promisify(cp.exec);

const pluginConfig = {
    name: "r",
    alias: ["exec", "ejecutar", "$"],
    category: "owner",

    description: "Ejecuta comandos de consola en el servidor.",
    usage: ".r <comando>",
    example: ".r pm2 list",

    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,

    cooldown: 0,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    // OURIN ya calcula m.isOwner
    if (!m.isOwner) return;

    const comando = (
        m.args?.join(" ") ||
        m.text ||
        ""
    ).trim();

    if (!comando) {
        return m.reply(
            `╭━━〔 ⚙️ EJECUTOR OURIN 〕━━╮
│
│ ❌ Falta el comando.
│
│ Ejemplo:
│ ${m.prefix}r pm2 list
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }

    try {
        // Procesando
        await m.react("🕒");

        const {
            stdout,
            stderr
        } = await exec(comando, {
            maxBuffer: 10 * 1024 * 1024
        });

        // Correcto
        await m.react("✔️");

        let respuesta = "";

        if (stdout?.trim()) {
            respuesta +=
                `╭━━〔 📤 SALIDA 〕━━╮\n` +
                `│\n` +
                `│ ${stdout.trim().replace(/\n/g, "\n│ ")}\n` +
                `│\n` +
                `╰━━━━━━━━━━━━━━━━━━╯`;
        }

        if (stderr?.trim()) {
            if (respuesta) respuesta += "\n\n";

            respuesta +=
                `╭━━〔 ⚠️ STDERR 〕━━╮\n` +
                `│\n` +
                `│ ${stderr.trim().replace(/\n/g, "\n│ ")}\n` +
                `│\n` +
                `╰━━━━━━━━━━━━━━━━━━╯`;
        }

        if (!respuesta) {
            respuesta =
                `╭━━〔 ✅ EJECUTADO 〕━━╮
│
│ El comando se ejecutó correctamente.
│
│ 💻 ${comando}
│
╰━━━━━━━━━━━━━━━━━━━━╯`;
        }

        return m.reply(respuesta);

    } catch (error) {
        // Error
        await m.react("✖️");

        return m.reply(
            `╭━━〔 ❌ ERROR DE EJECUCIÓN 〕━━╮
│
│ 💻 Comando:
│ ${comando}
│
│ 📛 Error:
│ ${error?.message || "Error desconocido"}
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
}

export {
    pluginConfig as config,
    handler
};
