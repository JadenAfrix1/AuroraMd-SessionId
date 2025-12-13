const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
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

const { upload } = require('./mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function AURORA_PAIR() {
        const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
        try {
            let Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        if (fs.existsSync('./auth_info_baileys/creds.json'));

                        const auth_path = './auth_info_baileys/';
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

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');
                        const Scan_Id = Id_session;

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
                                    sourceUrl: "https://whatsapp.com/channel/0029VajbiIfAjPXO45zG2i2c"
                                }
                            }
                        }, { quoted: msgsss });

                        await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) { }

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        AURORA_PAIR().catch(err => console.log(err));
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
            console.log("Error in AURORA_PAIR function: ", err);
            console.log("Service error occurred");
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) {
                await res.send({ code: "Try After Few Minutes" });
            }
        }
    }

    await AURORA_PAIR();
});

module.exports = router;
