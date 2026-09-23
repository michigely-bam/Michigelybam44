import fs from 'fs'
import path from 'path'
import gtts from 'gtts'
const pluginConfig = {
    name: 'cekkhodam',
    alias: ['khodam', 'cekhodam'],
    category: 'fun',
    description: 'Cek khodam diri sendiri atau orang lain',
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
    { name: "Harimau Putih", meaning: "Eres fuerte y valiente como un tigre, porque tu predecesor te dejó con gran poder." },
    { name: "Lampu Tertidur", meaning: "Parece somnoliento pero siempre da una luz cálida" },
    { name: "Panda Ompong", meaning: "Eres adorable y siempre logras hacer que la gente sonríe con tu rareza." },
    { name: "Bebek Karet", meaning: "Siempre estás tranquilo y alegre, capaz de enfrentar una ola de problemas con una sonrisa." },
    { name: "Ninja Turtle", meaning: "Eres friki y duro, listo para proteger a los débiles con tu fuerza de combate." },
    { name: "Kucing Kulkas", meaning: "Eres misteriosa y siempre en lugares inesperados." },
    { name: "Sabun Wangi", meaning: "Llevas tu fragancia y frescura donde estés." },
    { name: "Semut Kecil", meaning: "Eres un trabajador duro y siempre eres confiable en cualquier situación." },
    { name: "Cupcake Pelangi", meaning: "Eres dulce y colorido, siempre trayendo alegría y alegría." },
    { name: "Robot Mini", meaning: "Eres sofisticado y siempre listo para ayudar con inteligencia de alta tecnología." },
    { name: "Ikan Terbang", meaning: "Eres único y lleno de sorpresas, siempre más allá de los límites de la existencia." },
    { name: "Ayam Goreng", meaning: "Siempre te gusta y te espera tantos, tan deliciosos en cada movimiento." },
    { name: "Kecoa Terbang", meaning: "Siempre sorprendes y revuelves espacio tras habitación." },
    { name: "Kambing Ngebor", meaning: "Eres único y siempre haces que la gente se ría de tu comportamiento extraño." },
    { name: "Kerupuk Renyah", meaning: "Siempre haces las cosas más divertidas y divertidas." },
    { name: "Celengan Babi", meaning: "Siempre tienes una sorpresa." },
    { name: "Lemari Tua", meaning: "Estás lleno de historias y recuerdos del pasado." },
    { name: "Kopi Susu", meaning: "Eres dulce y siempre estás alentando a la gente que te rodea." },
    { name: "Sapu Lidi", meaning: "Eres fuerte y siempre eres confiable para limpiar el desastre." },
    { name: "Indomie Goreng", meaning: "Siempre lleno y feliz." },
    { name: "Es Krim Meleleh", meaning: "Siempre derritiendo el ambiente con dulzura." },
    { name: "Bakso Ulet", meaning: "Siempre persistente y redondo frente a problemas." },
    { name: "Lem Super", meaning: "Siempre pegajoso en situaciones complicadas" },
    { name: "Kecap Manis", meaning: "Siempre dar un toque dulce a la vida" },
    { name: "Sabun Mandi", meaning: "Siempre limpio y fragante" },
    { name: "Kopi Tumpah", meaning: "Selalu bersemangat, tapi kadang berantakan" },
    { name: "Kucing Kampung", meaning: "Siempre independiente y lleno de aventura" },
    { name: "Jamu Pahit", meaning: "Selalu memberi kekuatan meski tak enak di awal" },
    { name: "Teh Celup", meaning: "Selalu memberikan rasa hangat di hati" },
    { name: "Motor Astrea", meaning: "Siempre leal y travieso." },
    { name: "Mie Instan", meaning: "Siempre rápido y lleno" },
    { name: "Bolu Kukus", meaning: "Siempre suave y dulce" },
    { name: "Tahu Bulat", meaning: "Selalu enak di segala suasana" },
    { name: "Nasi Uduk", meaning: "Siempre encaja en todo momento." },
    { name: "Singa Bermahkota", meaning: "Naciste un líder, poseído de la fuerza y la sabiduría de un rey." },
    { name: "Macan Kumbang", meaning: "Eres misteriosa y poderosa, como un tigre que rara vez ha visto pero siempre está alerta." },
    { name: "Kuda Emas", meaning: "Eres preciosa y fuerte, lista para correr hacia el éxito." },
    { name: "Elang Biru", meaning: "Usted tiene una visión aguda y puede ver las probabilidades de lejos." },
    { name: "Naga Pelangi", meaning: "Eres duro y tienes el poder de proteger y atacar." },
    { name: "Gajah Putih", meaning: "Eres sabio y tienes gran poder, un símbolo de valentía y determinación." },
    { name: "Banteng Sakti", meaning: "Eres fuerte y lleno de espíritu, no temes a los obstáculos." },
    { name: "Kipas Angin", meaning: "Selalu memberikan angin segar" },
    { name: "Rice Cooker", meaning: "Siempre cocine el arroz perfectamente" },
    { name: "Honda Beat", meaning: "Selalu lincah di jalanan" },
    { name: "Sandal Jepit", meaning: "Siempre relajado y cómodo" },
    { name: "Bantal Guling", meaning: "Selalu nyaman di pelukan" },
    { name: "Anjing Pelacak", meaning: "Eres leal y dedicado, siempre encontrando tu camino." }
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
    let txt = `Halo kak ${targetName || ""}, Tu khodam es ${khodam.name}, Este khodam tiene un significado: ${khodam.meaning}`
    const tts = new gtts(txt, 'id')
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