
import baileys from '@whiskeysockets/baileys';

const WAMessageStubType = baileys.default;

export async function before(m, { conn, participants, groupMetadata}) {
  if (!m.messageStubType ||!m.isGroup) return;

  const mikuContact = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Miku🌸'
},
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD
VERSION:3.0
N:Miku;Bot;;;
FN:Miku Bot 🌸
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Celular
END:VCARD`
}
},
    participant: '0@s.whatsapp.net'
};

  const chat = global.db.data.chats[m.chat];
  const usuario = participants.find(p => p.id === m.sender)?.name || `@${m.sender.split`@`[0]}`;
  const img = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg';

  const eventos = {
    21: {
      mensaje: `🌸 *Nombre del grupo cambiado* 🌸\n👤 Usuario: ${usuario}\n🆕 Nuevo nombre: ${m.messageStubParameters[0]}`,
      tipo: 'texto'
},
    22: {
      mensaje: `🖼️ *Foto de grupo actualizada* 🖼️\n👤 Usuario: ${usuario}`,
      tipo: 'imagen',
      imagen: img
},
    23: {
      mensaje: `🔗 *Nuevo enlace de grupo* 🔗\n👤 Usuario: ${usuario}`,
      tipo: 'texto'
},
    24: {
      mensaje: `📝 *Descripción modificada* 📝\n👤 Usuario: ${usuario}\n💬 ${m.messageStubParameters?.[0] || 'Sin descripción'}`,
      tipo: 'texto'
},
    25: {
      mensaje: `⚙️ *Ajustes del grupo cambiados* ⚙️\n👤 Usuario: ${usuario}\n🔧 Ahora: ${m.messageStubParameters[0] === 'on'? 'Solo admins': 'Todos los miembros'}`,
      tipo: 'texto'
},
    26: {
      mensaje: `🚪 *Estado del grupo cambiado* 🚪\n👤 Usuario: ${usuario}\n🔓 Estado: ${m.messageStubParameters[0] === 'on'? 'Cerrado 🔒': 'Abierto 🔓'}`,
      tipo: 'texto'
},
    29: {
      mensaje: `👑 *Se ha ascendido a admin* 👑\n📌 Nuevo admin: ${participants.find(p => p.id === m.messageStubParameters[0])?.name || `@${m.messageStubParameters[0].split`@`[0]}`}\n🛠️ Por: ${usuario}`,
      tipo: 'texto'
},
    30: {
      mensaje: `⚠️ *Admin removido* ⚠️\n📌 Usuario: ${participants.find(p => p.id === m.messageStubParameters[0])?.name || `@${m.messageStubParameters[0].split`@`[0]}`}\n📉 Por: ${usuario}`,
      tipo: 'texto'
}
};

  if (chat.detect && eventos[m.messageStubType]) {
    const evento = eventos[m.messageStubType];
    if (evento.tipo === 'texto') {
      await conn.sendMessage(m.chat, { text: evento.mensaje, mentions: [m.sender]}, { quoted: mikuContact});
} else if (evento.tipo === 'imagen') {
      await conn.sendMessage(m.chat, { image: { url: evento.imagen}, caption: evento.mensaje, mentions: [m.sender]}, { quoted: mikuContact});
}
}
}