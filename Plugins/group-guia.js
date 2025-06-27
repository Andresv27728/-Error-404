
let handler = async (m, { conn}) => {
  const img = 'https://qu.ax/ARhkT.jpg';
  const texto = `
🌸 *𝑴𝑰𝑲𝑼 𝑩𝑶𝑻 - 𝑮𝑼𝑰́𝑨 𝑹𝑨́𝑷𝑰𝑫𝑨* 🌸

🛠️ *Comandos útiles para grupos:*

💬 _.on/off audios_ — Habilita sonidos
📣 _.todos_ — Menciona a todos
🔔 _.noti <mensaje>_ — Notifica sin mención
🔒 _.grupo abrir/cerrar_ — Controla acceso
👻 _.fantasmas_ — Muestra inactivos
🌼 _.on/off welcome_ — Activar bienvenida
👋 _.setwelcome <texto> @user_ — Mensaje de ingreso
🚪 _.setbye <texto> @user_ — Mensaje de salida
⭐ _.promote @tag_ — Hacer admin
📉 _.demote @tag_ — Quitar admin
🚫 _.del_ — Borra mensaje citado
📜 _.menu_ — Ver todos los comandos

🧩 ¿Tienes dudas o sugerencias?
📬 wa.me/595976126756
`;

  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Guía🌸'
},
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Miku;Bot;;;\nFN:Miku Bot 🌸\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Celular\nEND:VCARD`
}
},
    participant: '0@s.whatsapp.net'
};

  await conn.sendFile(m.chat, img, 'guia-miku.jpg', texto, fkontak);
};

handler.command = ['guia'];
handler.register = true;
export default handler;