const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
let router = express.Router();
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = `
*𝐀𝐔𝐑𝐎𝐑𝐀 𝐌𝐃 - 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃* ✅

𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐜𝐡𝐨𝐨𝐬𝐢𝐧𝐠 *𝐀𝐔𝐑𝐎𝐑𝐀 𝐌𝐃*

━━━━━━━━━━━━━━━━━━━━━
*📺 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐂𝐡𝐚𝐧𝐧𝐞𝐥:*
https://youtube.com/@MrAfrixTech

*💬 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐂𝐡𝐚𝐧𝐧𝐞𝐥:*
https://whatsapp.com/channel/0029VajbiIfAjPXO45zG2i2c
━━━━━━━━━━━━━━━━━━━━━

> 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 𝐌ʀ 𝐀ғʀɪx 𝐓ᴇᴄʜ
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    const { default: SuhailWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");

    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

    async function AURORA_QR() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys');

        try {
            let Smd = SuhailWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
                auth: state
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        try {
                            const qrBuffer = await toBuffer(qr);
                            res.end(qrBuffer);
                            return;
                        } catch (error) {
                            console.error("Error generating QR Code buffer:", error);
                            return;
                        }
                    }
                }

                if (connection == "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const Scan_Id = string_session;

                    console.log(`
====================  AURORA MD SESSION  ==========================                   
SESSION-ID ==> ${Scan_Id}
-------------------   SESSION CLOSED   -----------------------
`);

                    let msgsss = await Smd.sendMessage(user, { text: Scan_Id });

                    await Smd.sendMessage(user, {
                        image: { url: "https://files.catbox.moe/mx28jk.jpg" },
                        caption: MESSAGE,
                        contextInfo: {
                            forwardingScore: 5,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363419486513510@newsletter',
                                newsletterName: "𝐌ʀ 𝐀ғʀɪx 𝐓ᴇᴄʜ",
                                serverMessageId: 143
                            },
                            externalAdReply: {
                                showAdAttribution: true,
                                title: "AURORA MD",
                                body: "Session Generator by Mr Afrix Tech",
                                previewType: "PHOTO",
                                thumbnailUrl: "https://files.catbox.moe/mx28jk.jpg",
                                mediaType: 1,
                                mediaUrl: "https://files.catbox.moe/mx28jk.jpg",
                                sourceUrl: "https://whatsapp.com/channel/0029VbBkeEA05MUYnBMVLa37"
                            }
                        }
                    }, { quoted: msgsss });

                    await delay(1000);
                    try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) { }
                }

                Smd.ev.on('creds.update', saveCreds);

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        AURORA_QR().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                    }
                }
            });
        } catch (err) {
            console.log(err);
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }

    AURORA_QR().catch(async (err) => {
        console.log(err);
        await fs.emptyDirSync(__dirname + '/auth_info_baileys');
    });

    return await AURORA_QR();
});

module.exports = router;
