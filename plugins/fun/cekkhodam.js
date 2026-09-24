import fs from 'fs'
import path from 'path'
import gtts from 'gtts'
const pluginConfig = {
    name: 'cekkhodam',
    alias: ['khodam', 'cekhodam'],
    category: 'fun',
    description: "Compruebe a sí mismo o a otras personas.",
    usage: ".cekkhodam o responder el mensaje de alguien",
    example: '.cekkhodam',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}
const KHODAMS = [
    { name: "Tigre blanco", meaning: "Eres fuerte y valiente como un tigre, porque tu predecesor te dejó con gran poder." },
    { name: "Lámpara dormida", meaning: "Parece somnolienta, pero siempre da una luz cálida" },
    { name: "Panda desdentado", meaning: "Eres adorable y siempre logras hacer que la gente sonríe con tu rareza." },
    { name: "Pato de goma", meaning: "Siempre estás tranquilo y alegre, capaz de enfrentar una ola de problemas con una sonrisa." },
    { name: "Ninja Turtle", meaning: "Eres friki y duro, listo para proteger a los débiles con tu fuerza de combate." },
    { name: "Gato de nevera", meaning: "Eres misterioso y siempre apareces en lugares inesperados." },
    { name: "Jabón perfumado", meaning: "Llevas tu fragancia y frescura donde estés." },
    { name: "Hormiga pequeña", meaning: "Eres un trabajador duro y siempre eres confiable en cualquier situación." },
    { name: "Cupcake arcoíris", meaning: "Eres dulce y colorido, y siempre transmites alegría." },
    { name: "Robot Mini", meaning: "Eres sofisticado y siempre listo para ayudar con inteligencia de alta tecnología." },
    { name: "Pez volador", meaning: "Eres único y estás lleno de sorpresas; siempre superas los límites." },
    { name: "Pollo frito", meaning: "Le gustas a todo el mundo y siempre te esperan por lo irresistible que eres." },
    { name: "Cucaracha voladora", meaning: "Siempre sorprendes y alborotas cada habitación." },
    { name: "Cabra taladradora", meaning: "Eres único y siempre haces reír a la gente con tu comportamiento extraño." },
    { name: "Galleta crujiente", meaning: "Siempre haces que todo sea más divertido." },
    { name: "Alcancía de cerdito", meaning: "Siempre tienes una sorpresa." },
    { name: "Armario viejo", meaning: "Estás lleno de historias y recuerdos del pasado." },
    { name: "Café con leche", meaning: "Eres dulce y siempre animas a quienes te rodean." },
    { name: "Escoba de varillas", meaning: "Eres fuerte y siempre pueden confiar en ti para arreglar cualquier desastre." },
    { name: "Indomie frito", meaning: "Siempre estás satisfecho y feliz." },
    { name: "Helado derretido", meaning: "Siempre endulzas el ambiente." },
    { name: "Albóndiga tenaz", meaning: "Siempre perseveras ante los problemas." },
    { name: "Superpegamento", meaning: "Siempre te mantienes firme en las situaciones complicadas." },
    { name: "Salsa de soja dulce", meaning: "Siempre le das un toque dulce a la vida." },
    { name: "Jabón de baño", meaning: "Siempre estás limpio y perfumado." },
    { name: "Café derramado", meaning: "Siempre estás entusiasmado, aunque a veces seas desordenado." },
    { name: "Gato callejero", meaning: "Siempre eres independiente y estás lleno de espíritu aventurero." },
    { name: "Tónico amargo", meaning: "Siempre das fuerza, aunque al principio no resulte agradable." },
    { name: "Té de bolsita", meaning: "Siempre aportas calidez al corazón." },
    { name: "Motor Astrea", meaning: "Siempre leal y travieso." },
    { name: "Fideos instantáneos", meaning: "Siempre eres rápido y satisfactorio." },
    { name: "Bizcocho al vapor", meaning: "Siempre eres suave y dulce." },
    { name: "Tofu redondo", meaning: "Siempre es bueno en cualquier ambiente" },
    { name: "Arroz con coco", meaning: "Siempre encajas en cualquier momento." },
    { name: "León coronado", meaning: "Naciste para liderar, con la fuerza y la sabiduría de un rey." },
    { name: "Pantera", meaning: "Eres misterioso y poderoso; aunque rara vez te ven, siempre estás alerta." },
    { name: "Caballo dorado", meaning: "Eres valioso y fuerte, y estás listo para correr hacia el éxito." },
    { name: "Águila azul", meaning: "Tienes una visión aguda y puedes detectar oportunidades desde lejos." },
    { name: "Dragón arcoíris", meaning: "Eres resistente y tienes el poder de proteger y atacar." },
    { name: "Elefante blanco", meaning: "Eres sabio y poderoso, un símbolo de valentía y determinación." },
    { name: "Toro mágico", meaning: "Eres fuerte y enérgico; no temes a los obstáculos." },
    { name: "Ventilador", meaning: "Siempre aportas aire fresco." },
    { name: "Rice Cooker", meaning: "Siempre cocine el arroz perfectamente" },
    { name: "Honda Beat", meaning: "Siempre en las calles" },
    { name: "Chanclas", meaning: "Siempre estás relajado y cómodo." },
    { name: "Almohada cilíndrica", meaning: "Siempre resultas cómodo en un abrazo." },
    { name: "Perro rastreador", meaning: "Eres leal y dedicado, y siempre encuentras el camino." }
]
function getRandomKhodam() {
    const idx = Math.floor(Math.random() * KHODAMS.length)
    return KHODAMS[idx]
}
function handler(m, { sock }) {
    let targetJid = m.sender
    let targetName = m.pushName || m.sender.split('@')[0]
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    } else if(m.text) {
        targetName = m.text
    }
    const khodam = getRandomKhodam()
    let txt = `Hola, ${targetName || ""}, Tu khodam es ${khodam.name}, Este khodam tiene un significado: ${khodam.meaning}`
    const tts = new gtts(txt, 'es')
    const id = Date.now()
    const tempPath = path.join(process.cwd(), 'temp', `khodam-${id}.mp3`)
    tts.save(tempPath, async function (err) {
        if (err) return console.log(err)
        await sock.sendMedia(m.chat, fs.readFileSync(tempPath), null, m, { type: 'audio' })
        try {
            fs.unlinkSync(tempPath)
        } catch (error) {
        }
    })
}
export { pluginConfig as config, handler }
