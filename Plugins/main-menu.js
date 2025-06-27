
import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, __dirname, text, command }) => {
    const _p = usedPrefix
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let mentionedJid = [who]
    let username = conn.getName(who)
    let name = username
    let phoneNumber = PhoneNumber('+' + who.replace('@s.whatsapp.net', ''))
    let pais = phoneNumber.getCountryCode()

    // Función para obtener archivo aleatorio de la carpeta menu
    const getRandomMenuFile = () => {
        try {
            const menuPath = './menu'
            if (!fs.existsSync(menuPath)) {
                return './storage/img/avatar_contact.png'
            }
            
            const files = fs.readdirSync(menuPath).filter(file => {
                const ext = path.extname(file).toLowerCase()
                return ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm'].includes(ext)
            })
            
            if (files.length === 0) {
                return './storage/img/avatar_contact.png'
            }
            
            const randomFile = files[Math.floor(Math.random() * files.length)]
            return path.join(menuPath, randomFile)
        } catch (error) {
            return './storage/img/avatar_contact.png'
        }
    }

    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './storage/img/avatar_contact.png')
    let menuMedia = getRandomMenuFile()
    let user = global.db.data.users[who]
    let premium = user.premium
    let prems = `${premium ? '✅' : '❌'}`

    let { exp, limit, level, role } = global.db.data.users[who]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let d = new Date(new Date + 3600000)
    let locale = 'es'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
        process.send('uptime')
        _muptime = await new Promise(resolve => {
            process.once('message', resolve)
            setTimeout(resolve, 1000)
        }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let replace = {
        '%': '%',
        p: _p, uptime, muptime,
        me: conn.getName(conn.user.jid),
        npmname: _package.name,
        npmdesc: _package.description,
        version: _package.version,
        exp: exp - min,
        maxexp: xp,
        totalexp: exp,
        xp4levelup: max - exp,
        github: _package.homepage ? _package.homepage.url || _package.homepage : '[unknown github url]',
        level, limit, name, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
        readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

    // Obtener categorías de comandos
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
        return {
            help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
            tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
            prefix: 'customPrefix' in plugin,
            limit: plugin.limit,
            premium: plugin.premium,
            enabled: !plugin.disabled,
        }
    })

    // Categorizar comandos
    const categorizedCommands = {
        "🤖 INTELIGENCIA ARTIFICIAL": new Set(),
        "📥 DESCARGAS": new Set(),
        "🎮 JUEGOS": new Set(),
        "👑 OWNER": new Set(),
        "👥 GRUPOS": new Set(),
        "🔧 HERRAMIENTAS": new Set(),
        "🎶 AUDIOS": new Set(),
        "🔍 BUSCADORES": new Set(),
        "💰 ECONOMÍA": new Set(),
        "🔞 NSFW": new Set(),
        "🎨 ANIME": new Set(),
        "🔧 CONFIGURACIÓN": new Set(),
        "🔁 CONVERTIDORES": new Set(),
        "📊 INFORMACIÓN": new Set(),
        "🎉 DIVERSIÓN": new Set(),
        "📱 STICKERS": new Set(),
        "✨ EFECTOS": new Set(),
        "🔝 TOP": new Set(),
        "📋 OTROS": new Set()
    }

    const tagMapping = {
        'ai': "🤖 INTELIGENCIA ARTIFICIAL",
        'descargas': "📥 DESCARGAS",
        'game': "🎮 JUEGOS",
        'owner': "👑 OWNER",
        'group': "👥 GRUPOS",
        'tools': "🔧 HERRAMIENTAS",
        'audio': "🎶 AUDIOS",
        'search': "🔍 BUSCADORES",
        'economy': "💰 ECONOMÍA",
        'nsfw': "🔞 NSFW",
        'anime': "🎨 ANIME",
        'config': "🔧 CONFIGURACIÓN",
        'convert': "🔁 CONVERTIDORES",
        'info': "📊 INFORMACIÓN",
        'fun': "🎉 DIVERSIÓN",
        'sticker': "📱 STICKERS",
        'effect': "✨ EFECTOS",
        'top': "🔝 TOP"
    }

    for (let plugin of help) {
        if (plugin.help && plugin.tags && plugin.enabled) {
            const cmds = Array.isArray(plugin.help) ? plugin.help : plugin.help ? [plugin.help] : [''];
            cmds.forEach(cmd => {
                if (cmd) {
                    let foundCategory = false;
                    for (let tag of plugin.tags) {
                        if (tagMapping[tag]) {
                            categorizedCommands[tagMapping[tag]].add(cmd);
                            foundCategory = true;
                            break;
                        }
                    }
                    if (!foundCategory) {
                        categorizedCommands["📋 OTROS"].add(cmd);
                    }
                }
            });
        }
    }

    // Filtrar categorías vacías
    const categories = Object.entries(categorizedCommands)
        .filter(([_, cmds]) => cmds.size > 0)
        .map(([title, cmds]) => ({
            title,
            commands: [...cmds]
        }));

    // Determinar qué mostrar basado en el parámetro de categoría
    const categoryIndex = parseInt(text) || 0;
    const isMainMenu = !text || text === '' || isNaN(parseInt(text));

    if (isMainMenu) {
        // Mostrar información del usuario y lista de categorías
        const userInfo = `
╭───「 👤 𝗜𝗡𝗙𝗢 𝗨𝗦𝗨𝗔𝗥𝗜𝗢 」
│ 📝 Nombre: ${name}
│ 🎚️ Nivel: ${level}
│ ⭐ Experiencia: ${exp - min}/${xp}
│ 🌀 Límite: ${limit}
│ 💎 Premium: ${prems}
│ 🌍 País: ${pais}
│ 📅 Fecha: ${week}, ${date}
│ ⏰ Hora: ${time}
╰─────────────────

╭───「 📋 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗔𝗦 」
${categories.map((cat, index) => `│ ${index + 1}. ${cat.title} (${cat.commands.length})`).join('\n')}
╰─────────────────

💡 *Usa:* ${_p}menu <número> para ver los comandos de una categoría específica
🔄 *Ejemplo:* ${_p}menu 1`;

        const isVideo = ['.mp4', '.webm'].includes(path.extname(menuMedia).toLowerCase())
        
        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(menuMedia),
                caption: userInfo,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ MENÚ PRINCIPAL",
                        body: "Bot de WhatsApp",
                        thumbnailUrl: pp,
                        sourceUrl: "https://github.com",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                image: fs.readFileSync(menuMedia),
                caption: userInfo,
                contextInfo: {
                    externalAdReply: {
                        title: "✨ MENÚ PRINCIPAL",
                        body: "Bot de WhatsApp",
                        thumbnailUrl: pp,
                        sourceUrl: "https://github.com",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })
        }

    } else if (categoryIndex > 0 && categoryIndex <= categories.length) {
        // Mostrar comandos de la categoría específica
        const selectedCategory = categories[categoryIndex - 1];
        const commandList = selectedCategory.commands.map(cmd => {
            const plugin = Object.values(global.plugins).find(p => 
                Array.isArray(p.help) ? p.help.includes(cmd) : p.help === cmd
            );
            const premium = plugin?.premium ? '💎' : '';
            const limited = plugin?.limit ? '🌀' : '';
            return `│ 🦈 ${_p}${cmd} ${premium}${limited}`.trim();
        }).join('\n');

        const categoryMenu = `
╭───「 ${selectedCategory.title} 」
${commandList}
╰─────────────────

📊 Total de comandos: ${selectedCategory.commands.length}
🔙 Usa ${_p}menu para volver al menú principal
⬅️ Anterior: ${_p}menu ${categoryIndex > 1 ? categoryIndex - 1 : categories.length}
➡️ Siguiente: ${_p}menu ${categoryIndex < categories.length ? categoryIndex + 1 : 1}`;

        const categoryMedia = getRandomMenuFile()
        const isCategoryVideo = ['.mp4', '.webm'].includes(path.extname(categoryMedia).toLowerCase())
        
        if (isCategoryVideo) {
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(categoryMedia),
                caption: categoryMenu,
                contextInfo: {
                    externalAdReply: {
                        title: selectedCategory.title,
                        body: `${selectedCategory.commands.length} comandos disponibles`,
                        thumbnailUrl: pp,
                        sourceUrl: "https://github.com",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                image: fs.readFileSync(categoryMedia),
                caption: categoryMenu,
                contextInfo: {
                    externalAdReply: {
                        title: selectedCategory.title,
                        body: `${selectedCategory.commands.length} comandos disponibles`,
                        thumbnailUrl: pp,
                        sourceUrl: "https://github.com",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })
        }

    } else {
        // Número de categoría inválido
        m.reply(`❌ Categoría inválida. Usa un número del 1 al ${categories.length}\n\n💡 Usa ${_p}menu para ver todas las categorías disponibles.`);
    }
}

handler.help = ['menu', 'help', 'menú']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'menuall', 'help', 'commands']
handler.register = true

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

function xpRange(level, multiplier = global.multiplier || 1) {
    if (level < 0) {
        level = 0
    }
    return {
        min: level === 0 ? 0 : Math.round(Math.pow(level, 2.7) * 1000) + 1,
        max: Math.round(Math.pow(level + 1, 2.7) * 1000),
        xp: Math.round(Math.pow(level + 1, 2.7) * 1000) - Math.round(Math.pow(level, 2.7) * 1000)
    }
}
