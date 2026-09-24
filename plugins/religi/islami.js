import axios from 'axios'
import config from '../../config.js'
const pluginConfig = {
    name: 'islami',
    alias: [
        'asmaulhusna', 'niatsholat', 'niatshalat', 'surah', 'doa', 'berdoa', 
        'gislam'
    ],
    category: 'religi',
    description: "Funciones islámicas: los bellos nombres de Alá, intención de la oración, suras, súplicas, artículos y frases de sabiduría",
    usage: ".islami - función seleccionada",
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function fetchJson(url) {
    try {
        const response = await axios.get(url)
        return response.data
    } catch (e) {
        throw e
    }
}

async function handler(m, { sock }) {
    const command = m.command.toLowerCase()
    const text = m.text || ''

    try {
        switch (command) {
            case 'asmaulhusna': {
                let jir = await fetchJson('https://islamic-api-zhirrr.vercel.app/api/asmaulhusna')
                let ye = jir.data

                let tks = '☪️ *ASMAUL HUSNA*\n\n' + ye.map((item) => {
                    return `Orden: ${item.index}\nLatin: ${item.latin}\nArab: ${item.arabic}
Traducción al indonesio: ${item.translation_id}
Traducción al inglés: ${item.translation_en}\n`
                }).join('\n')
                m.reply(tks)
            }
            break

            case 'niatsholat': 
            case 'niatshalat': {
                let jir = await fetchJson('https://islamic-api-zhirrr.vercel.app/api/niatshalat')
                let niatSholat = jir

                if (!text) {
                    let daftarNiat = "📋 *LISTA DE INTENCIONES DE ORACIÓN*\n\n" + niatSholat.map((item) => `- ${item.name}`).join('\n')
                    daftarNiat += `

📌 Escribe \`${m.prefix}niatsholat [nombre de la oración]\` para ver las intenciones
Ejemplo: \`${m.prefix}niatsholat subuh\``
                    m.reply(daftarNiat)
                } else {
                    let hasil = niatSholat.find((item) => item.name.toLowerCase().includes(text.toLowerCase()))

                    if (hasil) {
                        let tks = `🕋 *${hasil.name.toUpperCase()}*\n\n` +
                            `📄 Arab: ${hasil.arabic}\n` +
                            `🔤 Latin: ${hasil.latin}\n` +
                            `🌍 Traducción: ${hasil.terjemahan}`
                        m.reply(tks)
                    } else {
                         m.reply("❌ La oración que buscabas no se encuentra. ¡Revisa de nuevo el nombre de la oración!")
                    }
                }
            }
            break

            case 'surah': {
                if (!text) {
                    m.reply(`⚠️ ¡Ingrese el número de la sección!
Ejemplo: \`${m.prefix}para tomar los versículos de Al-Fatihah.`)
                    return
                }

                m.reply("🕕 Cargando la sura...")
                let response = await fetchJson(`https://api.siputzx.my.id/api/s/surah?no=${text}`)
                let data = response.data
                if (data && data.length > 0) {
                    let surahText = data.map((ayat, index) =>
                        `۝ Versículo ${ayat.no}:\n` +
                        `${ayat.arab}\n` +
                        `${ayat.latin}\n` +
                        `_${ayat.indo}_`
                    ).join('\n\n')

                    if (surahText.length > 60000) {
                         m.reply("❌ La sura es demasiado larga para enviarla como texto. Por favor busque un versículo específico o un capítulo más corto.")
                    } else {
                        m.reply(surahText)
                    }
                } else {
                    m.reply("❌ ¡No lo encontré, vuelve a comprobar el número del capítulo!")
                }
            }
            break

            case 'doa':
            case 'berdoa': {
                let jir = await fetchJson('https://doa-doa-api-ahmadramadhan.fly.dev/api')
                let daftarDoa = jir

                if (!text) {
                    let listDoa = "🤲 *LISTA DE ORACIONES*\n\n" + daftarDoa.map((item) => `- ${item.doa}`).join('\n')
                     listDoa += `

📌 Escribe \`${m.prefix}oración [nombre de oración]\` para ver la oración
Ejemplo: \`${m.prefix}oración de oración antes de dormir`
                    m.reply(listDoa)
                } else {
                    let hasil = daftarDoa.find((item) => item.doa.toLowerCase().includes(text.toLowerCase()))

                    if (hasil) {
                        let tks = `🤲 *${hasil.doa.toUpperCase()}*\n\n` +
                            `📄 Versículo: ${hasil.ayat}\n` +
                            `🔤 Latin: ${hasil.latin}\n` +
                            `🌍 Significado: ${hasil.artinya}`
                        m.reply(tks)
                    } else {
                         m.reply("❌ La oración que buscas no se encuentra. ¡Revisa de nuevo el nombre de la oración!")
                    }
                }
            }
            break

            case 'gislam': {
                if (!text) return m.reply(`❓ ¿Sobre qué quieres buscar un artículo?
Ejemplo: \`${m.prefix}gislam puasa\``)
                
                try {
                    const response = await fetchJson(`https://artikel-islam.netlify.app/.netlify/functions/api/ms?page=1&s=${text}`)
                    if (response.success) {
                        const articles = response.data.data
                        if (!articles || articles.length === 0) return m.reply("❌ El artículo no fue encontrado.")

                        let message = `📚 *RESULTADOS DE LA BÚSQUEDA: ${text.toUpperCase()}*\nTotal: ${articles.length}\n\n`
                        articles.forEach((article, index) => {
                            message += `${index + 1}. *${article.title}*\n🔗 ${article.url}\n\n`
                        })
                        return m.reply(message)
                    } else {
                        return m.reply("❌ No se pudieron obtener los datos del artículo.")
                    }
                } catch (error) {
                    return m.reply("❌ Ocurrió un error al obtener los datos.")
                }
            }
            break
        }
    } catch (e) {
        console.error("Error del complemento religioso:", e)
        m.reply("❌ Ha habido un error en el sistema.")
    }
}

export { pluginConfig as config, handler }
