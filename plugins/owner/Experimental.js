import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";
import { GoogleGenAI } from "@google/genai";
import config from "../../config.js";

const MODEL = "gemini-3.8-flash";

const BATCH_SIZE = 12;
const WAIT_BETWEEN_REQUESTS = 1200;

const EXTENSIONS = [".js", ".mjs", ".cjs"];

const MEDIA_EXTENSIONS = new Set([
    ".jpg", ".jpeg", ".png", ".gif", ".webp",
    ".bmp", ".tiff", ".ico", ".svg",
    ".mp4", ".mkv", ".avi", ".mov", ".webm",
    ".mp3", ".wav", ".ogg", ".m4a", ".flac",
    ".aac", ".opus",
    ".webp",
    ".gif",
    ".sticker",
    ".pdf",
    ".zip",
    ".rar",
    ".7z"
]);

const INDONESIAN_WORDS = [
    "silakan",
    "masukkan",
    "gunakan",
    "pilih",
    "berhasil",
    "gagal",
    "tidak",
    "bukan",
    "belum",
    "sudah",
    "dengan",
    "tanpa",
    "hanya",
    "semua",
    "contoh",
    "perintah",
    "pesan",
    "gambar",
    "video",
    "audio",
    "nama",
    "nomor",
    "waktu",
    "hari",
    "jam",
    "menit",
    "detik",
    "grup",
    "saluran",
    "pengguna",
    "kategori",
    "tersedia",
    "ditemukan",
    "hapus",
    "kirim",
    "teks",
    "mohon",
    "coba",
    "tunggu",
    "ada",
    "untuk",
    "dari",
    "dan",
    "atau",
    "yang",
    "ini",
    "itu",
    "jika",
    "akan",
    "bisa",
    "sangat",
    "lebih",
    "kurang",
    "sekarang",
    "karena",
    "tentang",
    "setelah",
    "sebelum",
    "masih"
];

const PROTECTED_PATTERNS = [
    /^https?:\/\//i,
    /^data:/i,
    /^file:/i,
    /^mongodb:/i,
    /^postgres/i,
    /^mysql/i,
    /^redis/i,
    /node_modules/i,
    /application\/json/i,
    /authorization/i,
    /bearer\s/i,
    /content-type/i,
    /api[_-]?key/i,
    /apikey/i,
    /token/i,
    /process\./i,
    /import\s/i,
    /require\s*\(/i,
    /from\s+['"]/i,
    /\.js$/i,
    /\.json$/i
];

const VISIBLE_PATTERNS = [
    ".reply(",
    "reply(",
    "m.reply(",
    "m.send(",
    "sendMessage(",
    "caption:",
    "text:",
    "description:",
    "usage:",
    "example:",
    "title:",
    "body:",
    "footer:",
    "message:",
    "buttons:",
    "sections:",
    "description"
];

function obtenerApiKey() {
    return (
        config?.geminiApiKey ||
        config?.api?.geminiApiKey ||
        config?.gemini?.apiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY
    );
}

function crearGemini() {
    const apiKey = obtenerApiKey();

    if (!apiKey) {
        throw new Error(
            "No se encontró geminiApiKey en config.js"
        );
    }

    return new GoogleGenAI({
        apiKey
    });
}

function dormir(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

function asegurarDir(dir) {
    fs.mkdirSync(dir, {
        recursive: true
    });
}

function pareceMultimedia(nombre) {
    const ext = path.extname(nombre).toLowerCase();

    return MEDIA_EXTENSIONS.has(ext);
}

function obtenerLinea(texto, posicion) {
    return texto
        .slice(0, posicion)
        .split("\n")
        .length;
}

/*
 * Extrae strings de JavaScript.
 */
function extraerStrings(codigo) {
    const resultado = [];

    const regex =
        /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

    let match;

    while ((match = regex.exec(codigo))) {
        const texto = match[2];

        if (!texto?.trim()) {
            continue;
        }

        resultado.push({
            texto,
            inicio: match.index,
            fin: regex.lastIndex,
            linea: obtenerLinea(
                codigo,
                match.index
            )
        });
    }

    return resultado;
}

function pareceIndonesio(texto) {
    const t = texto.toLowerCase();

    let coincidencias = 0;

    for (const palabra of INDONESIAN_WORDS) {
        const regex = new RegExp(
            `(^|[^a-záéíóúñ])${palabra}([^a-záéíóúñ]|$)`,
            "i"
        );

        if (regex.test(t)) {
            coincidencias++;
        }
    }

    return coincidencias >= 1;
}

function estaProtegido(texto) {
    return PROTECTED_PATTERNS.some(
        regex => regex.test(texto)
    );
}

function pareceVisible(codigo, posicion) {
    const antes = codigo.slice(
        Math.max(0, posicion - 400),
        posicion
    );

    return VISIBLE_PATTERNS.some(
        patron => antes.includes(patron)
    );
}

/*
 * Analiza un archivo.
 */
function analizarArchivo(codigo, archivo) {
    const strings = extraerStrings(codigo);

    const seguros = [];
    const dudosos = [];
    const protegidos = [];

    for (const item of strings) {
        const texto = item.texto.trim();

        if (!pareceIndonesio(texto)) {
            continue;
        }

        const base = {
            archivo,
            linea: item.linea,
            texto,
            inicio: item.inicio,
            fin: item.fin
        };

        if (estaProtegido(texto)) {
            protegidos.push({
                ...base,
                motivo:
                    "URL, API, token, ruta o código protegido"
            });

            continue;
        }

        if (pareceVisible(codigo, item.inicio)) {
            seguros.push(base);
        } else {
            dudosos.push({
                ...base,
                motivo:
                    "No se pudo confirmar que sea texto visible"
            });
        }
    }

    return {
        seguros,
        dudosos,
        protegidos
    };
}

/*
 * Gemini analiza textos dudosos.
 */
async function analizarDudosos(ai, textos) {
    const prompt = `
Analiza textos encontrados dentro de plugins JavaScript.

Determina si cada texto es:

"visible" = probablemente lo verá el usuario.

"interno" = utilizado internamente por el código.

"incierto" = no puede determinarse con seguridad.

NO traduzcas.

Devuelve únicamente JSON válido.

Formato:

[
  {
    "id": 0,
    "clasificacion": "visible",
    "confianza": 0.95,
    "motivo": "..."
  }
]

TEXTOS:

${JSON.stringify(
    textos.map((x, i) => ({
        id: i,
        texto: x.texto,
        archivo: x.archivo,
        linea: x.linea
    })),
    null,
    2
)}
`;

    const response =
        await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: {
                responseMimeType:
                    "application/json"
            }
        });

    const contenido =
        response.text?.trim();

    if (!contenido) {
        throw new Error(
            "Gemini no devolvió análisis"
        );
    }

    return JSON.parse(contenido);
}

/*
 * Gemini traduce.
 */
async function traducirConGemini(ai, textos) {
    const prompt = `
Traduce del INDONESIO al ESPAÑOL.

REGLAS:

1. Traduce únicamente el texto humano.
2. Conserva exactamente:
   - emojis
   - variables
   - placeholders
   - menciones
   - comandos
   - URLs
   - símbolos especiales
3. NO traduzcas:
   {{user}}
   {name}
   %s
   %d
   @user
   .comando
   https://...
4. No agregues explicaciones.
5. No cambies el significado.
6. Devuelve únicamente JSON válido.

Formato:

[
  {
    "id": 0,
    "traduccion": "..."
  }
]

TEXTOS:

${JSON.stringify(
    textos.map((x, i) => ({
        id: i,
        texto: x.texto
    })),
    null,
    2
)}
`;

    const response =
        await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: {
                responseMimeType:
                    "application/json"
            }
        });

    const contenido =
        response.text?.trim();

    if (!contenido) {
        throw new Error(
            "Gemini no devolvió traducciones"
        );
    }

    return JSON.parse(contenido);
}

/*
 * Sustituye usando las posiciones exactas.
 * Esto evita el problema de indexOf().
 */
function aplicarCambios(codigo, cambios) {
    const ordenados = [...cambios]
        .sort((a, b) =>
            b.inicio - a.inicio
        );

    let resultado = codigo;

    for (const cambio of ordenados) {
        resultado =
            resultado.slice(
                0,
                cambio.inicio
            ) +
            cambio.traduccion +
            resultado.slice(
                cambio.fin
            );
    }

    return resultado;
}

/*
 * Procesa un archivo JS.
 */
async function procesarArchivo(
    ai,
    codigo,
    archivo
) {
    const analisis =
        analizarArchivo(
            codigo,
            archivo
        );

    const seguros =
        analisis.seguros;

    const dudosos =
        analisis.dudosos;

    const protegidos =
        analisis.protegidos;

    const cambios = [];

    for (
        let i = 0;
        i < seguros.length;
        i += BATCH_SIZE
    ) {
        const lote =
            seguros.slice(
                i,
                i + BATCH_SIZE
            );

        try {
            const traducciones =
                await traducirConGemini(
                    ai,
                    lote
                );

            for (
                const item
                of traducciones
            ) {
                const caso =
                    lote[item.id];

                if (!caso) {
                    continue;
                }

                if (
                    typeof item.traduccion !==
                    "string"
                ) {
                    continue;
                }

                cambios.push({
                    inicio: caso.inicio,
                    fin: caso.fin,
                    traduccion:
                        item.traduccion
                });
            }
        } catch (error) {
            console.error(
                "[TRADUCTOR]",
                archivo,
                error.message
            );
        }

        await dormir(
            WAIT_BETWEEN_REQUESTS
        );
    }

    return {
        cambios,
        seguros: seguros.length,
        dudosos: dudosos.length,
        protegidos: protegidos.length
    };
}

/*
 * Busca la configuración de texto
 * dentro del ZIP.
 */
function obtenerArchivosTraducibles(zip) {
    return zip
        .getEntries()
        .filter(entry => {
            if (entry.isDirectory) {
                return false;
            }

            const nombre =
                entry.entryName;

            if (pareceMultimedia(nombre)) {
                return false;
            }

            const ext =
                path.extname(nombre)
                    .toLowerCase();

            return EXTENSIONS.includes(ext);
        });
}

/*
 * Busca un ZIP en el mensaje citado.
 */
async function obtenerZipCitado(m) {
    if (!m.quoted) {
        return null;
    }

    if (
        !m.quoted.isDocument &&
        !m.quoted.isMedia
    ) {
        return null;
    }

    const documento =
        m.quoted.message
            ?.documentMessage;

    const nombre =
        documento?.fileName ||
        "archivo.zip";

    const mimetype =
        documento?.mimetype || "";

    const esZip =
        /\.zip$/i.test(nombre) ||
        mimetype.includes("zip") ||
        mimetype ===
            "application/octet-stream";

    if (!esZip) {
        return null;
    }

    if (
        typeof m.quoted.download !==
        "function"
    ) {
        throw new Error(
            "OURIN no pudo descargar el archivo citado."
        );
    }

    return {
        buffer:
            await m.quoted.download(),
        nombre
    };
}

/*
 * Envía el ZIP resultante.
 */
async function enviarZip(
    sock,
    m,
    ruta
) {
    const buffer =
        fs.readFileSync(ruta);

    await sock.sendMessage(
        m.chat,
        {
            document: buffer,
            mimetype:
                "application/zip",
            fileName:
                "OURIN-Traducido.zip",
            caption:
                `╭━━〔 🌐 OURIN AI TRANSLATOR 〕━━╮
│
│ ✅ Traducción terminada
│
│ 🇮🇩 → 🇪🇸 Indonesio → Español
│
│ 🖥️ Código traducido
│ 🛡️ Código protegido
│ 🚫 Multimedia ignorada
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        },
        {
            quoted: m
        }
    );
}

/*
 * Plugin OURIN.
 */
const pluginConfig = {
    name: "traducir",
    alias: [
        "translate",
        "traductor",
        "translateai"
    ],
    category: "owner",
    description:
        "Traduce un ZIP de plugins usando Gemini AI.",
    usage:
        ".traducir respondiendo a un ZIP",
    example:
        ".traducir",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    limit: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    if (!m.isOwner) {
        return;
    }

    try {
        const zipData =
            await obtenerZipCitado(m);

        if (!zipData) {
            return m.reply(
                `╭━━〔 🌐 OURIN AI TRANSLATOR 〕━━╮
│
│ ❌ Debes responder a un archivo
│    .zip con:
│
│    ${m.prefix}traducir
│
│ 📌 El ZIP puede contener plugins,
│    código y multimedia.
│
│ 🚫 La multimedia será ignorada.
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        if (
            !zipData.buffer ||
            !Buffer.isBuffer(
                zipData.buffer
            )
        ) {
            return m.reply(
                "❌ No se pudo obtener el contenido del ZIP."
            );
        }

        await m.react("🔎");

        const tempDir =
            fs.mkdtempSync(
                path.join(
                    os.tmpdir(),
                    "ourin-translator-"
                )
            );

        const inputZip =
            path.join(
                tempDir,
                "input.zip"
            );

        const outputZip =
            path.join(
                tempDir,
                "OURIN-Traducido.zip"
            );

        fs.writeFileSync(
            inputZip,
            zipData.buffer
        );

        const zip =
            new AdmZip(inputZip);

        const ai =
            crearGemini();

        const entries =
            obtenerArchivosTraducibles(
                zip
            );

        const todos =
            zip.getEntries();

        const multimedia =
            todos.filter(
                entry =>
                    !entry.isDirectory &&
                    pareceMultimedia(
                        entry.entryName
                    )
            ).length;

        if (!entries.length) {
            fs.rmSync(
                tempDir,
                {
                    recursive: true,
                    force: true
                }
            );

            return m.reply(
                `❌ No encontré archivos JavaScript traducibles dentro del ZIP.

Extensiones admitidas:
.js
.mjs
.cjs`
            );
        }

        await m.reply(
            `╭━━〔 🔎 ANÁLISIS ZIP 〕━━╮
│
│ 📦 Archivo: ${zipData.nombre}
│
│ 📁 Archivos totales:
│    ${todos.length}
│
│ 💻 Archivos JS:
│    ${entries.length}
│
│ 🚫 Multimedia ignorada:
│    ${multimedia}
│
│ 🤖 Gemini:
│    ${MODEL}
│
│ ⏳ Iniciando...
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );

        let archivosModificados = 0;
        let textosTraducidos = 0;
        let textosDudosos = 0;
        let textosProtegidos = 0;

        for (
            let i = 0;
            i < entries.length;
            i++
        ) {
            const entry =
                entries[i];

            try {
                const originalBuffer =
                    entry.getData();

                const codigo =
                    originalBuffer.toString(
                        "utf8"
                    );

                const resultado =
                    await procesarArchivo(
                        ai,
                        codigo,
                        entry.entryName
                    );

                textosDudosos +=
                    resultado.dudosos;

                textosProtegidos +=
                    resultado.protegidos;

                if (
                    resultado.cambios.length
                ) {
                    const nuevoCodigo =
                        aplicarCambios(
                            codigo,
                            resultado.cambios
                        );

                    zip.updateFile(
                        entry.entryName,
                        Buffer.from(
                            nuevoCodigo,
                            "utf8"
                        )
                    );

                    archivosModificados++;

                    textosTraducidos +=
                        resultado.cambios.length;
                }
            } catch (error) {
                console.error(
                    "[OURIN-TRANSLATOR]",
                    entry.entryName,
                    error
                );
            }

            if (
                (i + 1) % 10 === 0 ||
                i === entries.length - 1
            ) {
                await m.reply(
                    `🔄 *Procesando ZIP...*

📂 ${i + 1}/${entries.length}

📝 Textos traducidos:
${textosTraducidos}

🟡 Dudosos:
${textosDudosos}

🔴 Protegidos:
${textosProtegidos}

🖥️ Archivos modificados:
${archivosModificados}`
                );
            }
        }

        zip.writeZip(
            outputZip
        );

        await m.react("✅");

        await m.reply(
            `╭━━〔 ✅ TRADUCCIÓN TERMINADA 〕━━╮
│
│ 📦 ZIP preparado
│
│ 📝 Textos traducidos:
│    ${textosTraducidos}
│
│ 🖥️ Archivos modificados:
│    ${archivosModificados}
│
│ 🟡 Dudosos sin modificar:
│    ${textosDudosos}
│
│ 🔴 Protegidos:
│    ${textosProtegidos}
│
│ 🚫 Multimedia ignorada:
│    ${multimedia}
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

📤 Enviando ZIP...`
        );

        await enviarZip(
            sock,
            m,
            outputZip
        );

        fs.rmSync(
            tempDir,
            {
                recursive: true,
                force: true
            }
        );

    } catch (error) {
        console.error(
            "[OURIN-TRANSLATOR]",
            error
        );

        await m.react("❌");

        return m.reply(
            `╭━━〔 ❌ ERROR 〕━━╮
│
│ ${error?.message ||
                "Error desconocido"}
│
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
}

export {
    pluginConfig as config,
    handler
};
