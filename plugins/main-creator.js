
import PhoneNumber from 'awesome-phonenumber';

async function handler(m, { conn}) {
  let numcreador = '573133374132';
  let ownerJid = numcreador + '@s.whatsapp.net';

  let name = await conn.getName(ownerJid) || '💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖';
  let about = (await conn.fetchStatus(ownerJid).catch(() => {}))?.status || '🦈 Creador del bot *Gawr Gura 🦈*.';
  let empresa = '💖💝 Y⃟o⃟ S⃟o⃟y⃟ Y⃟o⃟ 💝 💖';
  let imagen = 'https://n.uguu.se/iLFFNQMb.jpg';

  const caption = `
╔═══🌸 *INFORMACIÓN DE LA CREADORA* 🌸═══╗
👩‍💻 *Nombre:* ${name}
📱 *Número:* wa.me/${numcreador}
📝 *Descripción:* ${about}
🏢 *Empresa:* ${empresa}
╚════════════════════════════════╝`.trim();

  await conn.sendMessage(m.chat, {
    image: { url: imagen},
    caption: caption
}, { quoted: m});
}

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;
