const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const pino = require('pino');
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const admin = require('firebase-admin');

require('dotenv').config();

const quizEngine = require('./quizEngine');
const grammarWatchdog = require('./grammarWatchdog');
const paymentHandler = require('./paymentHandler');
const commands = require('./commands');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// =====================================
// SYSTEM GUARDS
// =====================================
process.on('uncaughtException', (err) => {
    console.log('⚠️ System Error:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.log('⚠️ Rejection Guard:', err.message);
});


// =====================================
// CONFIG
// =====================================
const OWNER_NUMBER = "2347051768946";
const BOT_NAME = "JARVIS AI";
const POWERED_BY = "Flexi Digital Academy";

const MONGO_URI =
    "mongodb+srv://JarvisAI:flexisystems2000@cluster0.7g5odvt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const firebaseConfig = {
    apiKey: "AIzaSyCoGX2bXlvuwcJY8oyW6_J42fgxfH5vZao",
    authDomain: "jarvisai-1a594.firebaseapp.com",
    projectId: "jarvisai-1a594",
    storageBucket: "jarvisai-1a594.firebasestorage.app",
    messagingSenderId: "868499596875",
    appId: "1:868499596875:web:4bf592934f6086be8a4fce"
};


// =====================================
// DATABASE (MONGODB)
// =====================================
const WarnSchema = new mongoose.Schema({
    userId: String,
    count: {
        type: Number,
        default: 0
    }
});

const ConfigSchema = new mongoose.Schema({
    keyName: String,
    keyValue: String
});

const Warn = mongoose.model('Warn', WarnSchema);
const Config = mongoose.model('Config', ConfigSchema);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
    })
    .catch((err) => {
        console.log("❌ DB Error:", err.message);
    });


// =====================================
// FIREBASE (FIXED)
// =====================================
if (!admin.apps.length) {

    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log("✅ Firebase Connected");
}

const db = admin.firestore();


// =====================================
// AI FUNCTION
// =====================================
async function askAI(
    prompt,
    base64Media = null,
    isPDF = false
) {
    try {

        const endpoint =
            isPDF ? 'pdf' : 'ai';

        const payload = {
            prompt,
            ...(isPDF
                ? { fileBase64: base64Media }
                : { image: base64Media })
        };

        const res = await axios.post(
            `https://flexieduconsult-ai-link-z60r.onrender.com/${endpoint}`,
            payload
        );

        return (
            res.data?.result ||
            "🤖 No response from AI"
        );

    } catch (err) {

        console.log(
            "AI LINK ERROR:",
            err.message
        );

        return "⚠️ AI service unavailable.";
    }
}


// =====================================
// GLOBAL STATE
// =====================================
const groupCache = new Map();
const activityTracker = new Map();

let protocolFired = false;


// =====================================
// MIDNIGHT RESET (WAT)
// =====================================
setInterval(() => {

    const hour =
        new Date().toLocaleString(
            "en-US",
            {
                timeZone: "Africa/Lagos",
                hour: "2-digit",
                hour12: false
            }
        );

    if (hour === "00") {

        protocolFired = false;

        console.log(
            "🔄 Protocol reset (Nigeria Midnight)"
        );
    }

}, 60000);


// =====================================
// MEDIA DOWNLOADER
// =====================================
async function downloadMedia(message) {

    const type =
        Object.keys(message)[0];

    const stream =
        await downloadContentFromMessage(
            message[type],
            type.replace(
                'Message',
                ''
            )
        );

    let buffer =
        Buffer.from([]);

    for await (
        const chunk of stream
    ) {
        buffer =
            Buffer.concat([
                buffer,
                chunk
            ]);
    }

    return buffer;
}


// =====================================
// PHONE NORMALIZER
// =====================================
function normalizePhone(
    input = ""
) {
    return input
        .toString()
        .replace(/\D/g, '')
        .replace(/^0/, '234');
}

let sock;

// =====================================
// BOT START
// =====================================
async function startJARVIS() {

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        'auth_info'
    );

    const {
        version
    } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({
            level: 'silent'
        }),

        browser: [
            "Mac OS",
            "Chrome",
            "125.0.0"
        ],

        keepAliveIntervalMs:
            30000,

        connectTimeoutMs:
            60000,

        syncFullHistory:
            false
    });


    // =========================
    // SAVE CREDS
    // =========================
    sock.ev.on(
        'creds.update',
        saveCreds
    );


    // =========================
    // CONNECTION UPDATE
    // =========================
    sock.ev.on(
        'connection.update',
        async (update) => {

            const {
                connection,
                lastDisconnect
            } = update;

            if (
                connection === 'close'
            ) {

                const shouldReconnect =
                    (
                        lastDisconnect?.error
                        instanceof Boom
                    )?.output?.statusCode
                    !==
                    DisconnectReason.loggedOut;

                if (
                    shouldReconnect
                ) {

                    console.log(
                        "🔄 Reconnecting JARVIS..."
                    );

                    startJARVIS();
                }

            } else if (
                connection === 'open'
            ) {

                console.log(
                    `✅ ${BOT_NAME} Online & Synced`
                );
            }
        }
    );


    // =========================
    // GROUP WELCOME / GOODBYE
    // =========================
    sock.ev.on(
        'group-participants.update',
        async (anu) => {

            const jid =
                anu.id;

            if (!jid)
                return;

            await new Promise(
                r => setTimeout(
                    r,
                    1500
                )
            );

            try {

                let metadata =
                    groupCache.get(
                        jid
                    ) ||

                    await sock.groupMetadata(
                        jid
                    ).catch(() => ({
                        subject:
                            "this group"
                    }));

                const groupName =
                    metadata.subject;

                for (
                    const num
                    of anu.participants
                ) {

                    const participantJid =
                        typeof num
                            === 'string'
                            ? num
                            : num.id;

                    if (
                        participantJid ===
                        sock.user.id
                            .split(':')[0]
                        +
                        '@s.whatsapp.net'
                    ) continue;

                    const userTag =
                        participantJid
                            .split('@')[0];


                    // =====================
                    // USER JOINED
                    // =====================
                    if (
                        anu.action
                        === 'add'
                    ) {

                        await sock.sendMessage(
                            jid,
                            {
                                text:
`👋 Hello @${userTag}

🎓 *Welcome to ${groupName}*

📚 _For 2026 JAMB Candidates Only_

Daily revision based on the JAMB syllabus with intensive brainstorming sessions ✍️📖

⚠️ *GROUP RULES*
• Posting of links is strictly prohibited
• Avoid using stickers during lessons
• Stay on topic during classes
• Do not tag the group in your status
• Be active in group activities
• Inactive members may be removed
• Feel free to invite serious SSCE/UTME candidates

💡 Read, learn, participate and succeed.

_Powered by Flexi Educational Consult_ 🚀`,
                                mentions: [
                                    participantJid
                                ]
                            }
                        );
                    }


                    // =====================
                    // USER LEFT
                    // =====================
                    else if (
                        anu.action
                        === 'remove'
                    ) {

                        await sock.sendMessage(
                            jid,
                            {
                                text:
`👋 @${userTag} has left *${groupName}*

We appreciate the time spent with us and wish you success in your academics and future examinations 🎓✨

Keep striving for excellence and never stop learning.

_Flexi Educational Consult_ 🚀`,
                                mentions: [
                                    participantJid
                                ]
                            }
                        );
                    }
                }

            } catch (err) {

                console.log(
                    "Automation Error:",
                    err.message
                );
            }
        }
    );


    // =====================================
    // MESSAGES UPSERT STARTS HERE
    // =====================================
    sock.ev.on(
        'messages.upsert',
        async ({ messages }) => {
            const m = messages[0];

            if (!m?.message) return;
            if (m.key.fromMe) return;

            const jid =
                m.key.remoteJid;

            const sender =
                m.key.participant ||
                jid;


            // =========================
            // MESSAGE PARSING
            // =========================
            const body =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                "";

            const text =
                body
                    .toLowerCase()
                    .trim();

            const isOwner =
                sender.includes(
                    OWNER_NUMBER
                );


            // =========================
            // LIVE QUIZ INTERCEPTOR
            // =========================
            const wasQuizMessage =
                await quizEngine
                    .handleLiveMarking(
                        sock,
                        jid,
                        sender,
                        body,
                        m
                    );

            if (
                wasQuizMessage
            ) return;


            // =========================
            // JARVIS REACTION
            // =========================
            if (
                !m.key.fromMe &&
                text.includes(
                    "jarvis"
                ) &&
                !text.startsWith(
                    "!"
                )
            ) {

                await sock.sendMessage(
                    jid,
                    {
                        react: {
                            key: m.key,
                            text: "🤖"
                        }
                    }
                );
            }


            // =========================
            // GRAMMAR WATCHDOG
            // =========================
            if (
                !m.key.fromMe &&
                body
            ) {

                const correctedVersion =
                    await grammarWatchdog
                        .autoCorrectGrammar(
                            body
                        );

                if (
                    correctedVersion &&
                    correctedVersion
                        .trim()
                        .toLowerCase()
                    !==
                    body
                        .trim()
                        .toLowerCase()
                ) {

                    const userTag =
                        sender
                            .split(
                                '@'
                            )[0];

                    const alertPayload =
`📝 *Grammar Check Alert* 📝

@${userTag}, I noticed a minor slip in your structure.

👉 *"${correctedVersion}"*`;

                    await sock.sendMessage(
                        jid,
                        {
                            text:
                                alertPayload,

                            mentions:
                                [sender]
                        },
                        {
                            quoted:
                                m
                        }
                    );
                }
            }


            // =========================
            // STAFF CHECK
            // =========================
            let metadata;
            let isStaff =
                isOwner;

            if (
                jid.endsWith(
                    '@g.us'
                )
            ) {

                try {

                    metadata =
                        groupCache.get(
                            jid
                        );

                    if (
                        !metadata ||
                        Date.now() -
                        (
                            metadata.lastFetch ||
                            0
                        )
                        >
                        300000
                    ) {

                        metadata =
                            await sock
                                .groupMetadata(
                                    jid
                                );

                        metadata.lastFetch =
                            Date.now();

                        groupCache.set(
                            jid,
                            metadata
                        );
                    }

                    const admins =
                        (
                            metadata
                                .participants ||
                            []
                        )
                            .filter(
                                p => p.admin
                            )
                            .map(
                                p => p.id
                            );

                    isStaff =
                        isOwner ||
                        admins.includes(
                            sender
                        );

                } catch (
                    err
                ) {

                    isStaff =
                        isOwner;
                }
            }


            // =========================
            // WATCHDOG
            // =========================
            if (
                jid.endsWith(
                    '@g.us'
                ) &&
                !isStaff &&
                !m.key.fromMe
            ) {

                const badWords = [
                    "rubbish",
                    "mumu",
                    "foolish",
                    "stupid",
                    "bastard",
                    "ode"
                ];

                const isLink =
                    text.includes(
                        "http"
                    ) ||
                    text.includes(
                        ".com"
                    ) ||
                    text.includes(
                        "chat.whatsapp"
                    );

                const isBadWord =
                    badWords.some(
                        word =>
                            text.includes(
                                word
                            )
                    );

                if (
                    isLink ||
                    isBadWord
                ) {

                    await sock
                        .sendMessage(
                            jid,
                            {
                                delete:
                                    m.key
                            }
                        )
                        .catch(
                            () => {}
                        );

                    let userWarn =
                        await Warn
                            .findOneAndUpdate(
                                {
                                    userId:
                                        sender
                                },
                                {
                                    $inc:
                                        {
                                            count:
                                                1
                                        }
                                },
                                {
                                    upsert:
                                        true,

                                    new:
                                        true
                                }
                            );

                    if (
                        userWarn.count
                        >= 3
                    ) {

                        await sock.sendMessage(
                            jid,
                            {
                                text:
`🚫 @${sender.split('@')[0]} removed (3 Strikes).`,
                                mentions:
                                    [
                                        sender
                                    ]
                            }
                        );

                        await sock.groupParticipantsUpdate(
                            jid,
                            [sender],
                            "remove"
                        );

                        await Warn.deleteOne(
                            {
                                userId:
                                    sender
                            }
                        );

                    } else {

                        await sock.sendMessage(
                            jid,
                            {
                                text:
`⚠️ *Watchdog*
@${sender.split('@')[0]}, violation detected (${userWarn.count}/3).`,
                                mentions:
                                    [
                                        sender
                                    ]
                            }
                        );
                    }

                    return;
                }
            }


            // =========================
            // COMMANDS
            // =========================
            const command =
                text
                    .split(
                        / +/
                    )[0];

            const args =
                body
                    .trim()
                    .split(
                        / +/
                    )
                    .slice(1);


            // =========================
            // COMMANDS.JS
            // =========================
            await commands(
                sock,
                m,
                command,
                args,
                jid,
                sender,
                isStaff,
                Warn,
                activityTracker,
                askAI,
                downloadMedia,
                metadata,
                BOT_NAME,
                POWERED_BY,
                OWNER_NUMBER
            );


            // =========================
            // FILE / AI SYSTEM
            // =========================
            if (
                jid.endsWith(
                    '@g.us'
                ) &&
                (
                    text.startsWith(
                        "!ai"
                    ) ||
                    text.includes(
                        "jarvis"
                    )
                )
            ) {

                const isDoc =
                    !!m.message
                        .documentMessage;

                const isImg =
                    !!m.message
                        .imageMessage ||

                    !!m.message
                        .extendedTextMessage
                        ?.contextInfo
                        ?.quotedMessage
                        ?.imageMessage;

                if (
                    isDoc ||
                    isImg
                ) {

                    await sock.sendMessage(
                        jid,
                        {
                            react: {
                                key:
                                    m.key,
                                text:
                                    "📂"
                            }
                        }
                    );

                    await sock.sendPresenceUpdate(
                        'composing',
                        jid
                    );

                    try {

                        let mediaMessage;

                        if (
                            isDoc
                        ) {

                            mediaMessage =
                                m.message
                                    .documentMessage;

                        } else {

                            mediaMessage =
                                m.message
                                    .imageMessage
                                    ? m.message
                                    : m.message
                                          .extendedTextMessage
                                          ?.contextInfo
                                          ?.quotedMessage;
                        }

                        const buffer =
                            await downloadMedia(
                                mediaMessage
                            );

                        const base64Media =
                            buffer.toString(
                                'base64'
                            );

                        const fileName =
                            isDoc
                                ? m.message
                                      .documentMessage
                                      .fileName
                                : "Image Analysis";

                        const aiReply =
                            await askAI(
                                body ||
                                `Please analyze this file: ${fileName}`,
                                base64Media
                            );

                        return sock.sendMessage(
                            jid,
                            {
                                text:
`🎓 *GROUP STUDY ASSISTANT*

${aiReply}`
                            },
                            {
                                quoted:
                                    m
                            }
                        );

                    } catch (
                        err
                    ) {

                        console.log(
                            "File Error:",
                            err.message
                        );

                        return sock.sendMessage(
                            jid,
                            {
                                text:
"⚠️ I couldn't read that file. Ensure it's a PDF or Image."
                            }
                        );
                    }
                }
            }


            // =========================
            // FILE CREATOR
            // =========================
            if (
                text.includes(
                    "create file"
                ) ||
                text.includes(
                    "generate pdf"
                ) ||
                text.includes(
                    "write note"
                )
            ) {

                await sock.sendMessage(
                    jid,
                    {
                        react: {
                            key:
                                m.key,
                            text:
                                "📝"
                        }
                    }
                );

                await sock.sendPresenceUpdate(
                    'composing',
                    jid
                );

                const contentPrompt =
`Create a detailed, professional study document based on this request: ${text}. Format it clearly for students.`;

                const content =
                    await askAI(
                        contentPrompt
                    );

                const fileBuffer =
                    Buffer.from(
                        content,
                        'utf-8'
                    );

                const cleanName =
                    text
                        .split(
                            "file"
                        )[1]
                        ?.trim()
                        ?.replace(
                            / /g,
                            "_"
                        )
                    ||
                    "JARVIS_Study_Note";

                return sock.sendMessage(
                    jid,
                    {
                        document:
                            fileBuffer,

                        mimetype:
                            'text/plain',

                        fileName:
`${cleanName}.txt`,

                        caption:
`✅ *JARVIS Document Generator*

Study notes generated successfully.`
                    },
                    {
                        quoted:
                            m
                    }
                );
            }


            // =========================
            // askAI PROTOCOL
            // =========================
            const nigeriaTime =
                new Intl
                    .DateTimeFormat(
                        'en-GB',
                        {
                            timeZone:
                                'Africa/Lagos',
                            hour:
                                'numeric',
                            hour12:
                                false
                        }
                    )
                    .format(
                        new Date()
                    );

            const currentHourWAT =
                parseInt(
                    nigeriaTime
                );

            if (
                isStaff &&
                !isNaN(
                    currentHourWAT
                )
            ) {

                if (
                    currentHourWAT >=
                    19 &&
                    !protocolFired &&
                    !text.startsWith(
                        "!"
                    )
                ) {

                    const subjects = [
                        "math",
                        "physics",
                        "chemistry",
                        "biology",
                        "english",
                        "economics",
                        "government"
                    ];

                    const foundSubject =
                        subjects.find(
                            s =>
                                text.includes(
                                    s
                                )
                        );

                    if (
                        foundSubject
                    ) {

                        const adminTag =
`@${sender.split('@')[0]}`;

                        await sock.sendMessage(
                            jid,
                            {
                                text:
`================
*askAI PROTOCOL ONLINE*
================
${adminTag} Kindly use !ai to fetch PostUTME questions for ${foundSubject.toUpperCase()}`,
                                mentions:
                                    [
                                        sender
                                    ]
                            }
                        );

                        protocolFired =
                            true;
                    }
                }
                                }
            // =========================
            // TIMETABLE
            // =========================
            if (command === "!timetable") {

                try {

                    const timetableUrl =
"https://i.postimg.cc/vTyBtTzS/IMG-20260511-WA0031.jpg";

                    const response =
                        await axios.get(
                            timetableUrl,
                            {
                                responseType:
                                    'arraybuffer'
                            }
                        );

                    await sock.sendMessage(
                        jid,
                        {
                            image:
                                Buffer.from(
                                    response.data
                                ),

                            caption:
`🗓️ *POST UTME TUTORIALS 2025/2026*

✅ *Starts:* 11th July
💰 *Fee:* ₦6,000 monthly

📢 Join WhatsApp group:
https://chat.whatsapp.com/KoI4QtlwggOFtGyoE0MYY4

_Powered by ${POWERED_BY}_`
                        }
                    );

                } catch (err) {

                    console.log(
                        "Timetable Error:",
                        err.message
                    );

                    await sock.sendMessage(
                        jid,
                        {
                            text:
"❌ Failed to load timetable image."
                        }
                    );
                }
            }


            // =========================
            // LIST ADMINS
            // =========================
            if (
                command ===
                "!listadmins"
            ) {

                if (
                    !jid.endsWith(
                        '@g.us'
                    )
                ) {

                    return sock.sendMessage(
                        jid,
                        {
                            text:
"❌ This command only works in groups."
                        }
                    );
                }

                try {

                    let metadata =
                        groupCache.get(
                            jid
                        );

                    if (
                        !metadata ||
                        Date.now() -
                        (
                            metadata.lastFetch ||
                            0
                        )
                        >
                        300000
                    ) {

                        metadata =
                            await sock.groupMetadata(
                                jid
                            );

                        metadata.lastFetch =
                            Date.now();

                        groupCache.set(
                            jid,
                            metadata
                        );
                    }

                    const admins =
                        metadata
                            .participants
                            .filter(
                                p =>
                                    p.admin
                            );

                    let adminList =
`👑 *${metadata.subject} Admins*

`;

                    admins.forEach(
                        (
                            admin,
                            index
                        ) => {

                            adminList +=
`${index + 1}. @${admin.id.split('@')[0]}
`;
                        }
                    );

                    adminList +=
`\n🤖 _Powered by ${POWERED_BY}_`;

                    await sock.sendMessage(
                        jid,
                        {
                            text:
                                adminList,

                            mentions:
                                admins.map(
                                    a => a.id
                                )
                        }
                    );

                } catch (
                    err
                ) {

                    console.log(
                        "ListAdmins Error:",
                        err.message
                    );

                    await sock.sendMessage(
                        jid,
                        {
                            text:
"❌ Failed to fetch admin list."
                        }
                    );
                }
            }


            // =========================
            // MENU / HELP
            // =========================
            if (
                command ===
                "!menu" ||
                command ===
                "!help"
            ) {

                const menuText =
`🤖 *${BOT_NAME} SYSTEM MENU*

*Powered by ${POWERED_BY}*

━━━━━━━━━━━━━━━━━━━━
✨ *AI & UTILITY*
🔹 *!ai [query]*
🔹 *!ginfo*
🔹 *!listonline*
🔹 *!timetable*
🔹 *!listadmins*
🔹 *!image*

🛡️ *GROUP MODERATION*
🔸 *!add [number]*
🔸 *!kick @user*
🔸 *!promote @user*
🔸 *!mute [time] [unit]*
🔸 *!unmute [time] [unit]*
🔸 *!reset @user*

🚫 *SYSTEM PROTECTIONS*
✅ Watchdog
✅ Auto-Greet
━━━━━━━━━━━━━━━━━━━━`;

                return sock.sendMessage(
                    jid,
                    {
                        text:
                            menuText
                    },
                    {
                        quoted:
                            m
                    }
                );
            }


            // =========================
            // PAYMENT
            // =========================
            if (
                command ===
                "!pay"
            ) {

                await paymentHandler
                    .handlePaymentRequest(
                        sock,
                        m,
                        sender,
                        args
                    );

                return;
            }


            // =========================
            // !NAME
            // =========================
            if (
                body.startsWith(
                    "!name "
                )
            ) {

                try {

                    const suppliedName =
                        body
                            .replace(
                                "!name ",
                                ""
                            )
                            .trim();

                    if (
                        !suppliedName ||
                        suppliedName.length <
                        2
                    ) {

                        await sock.sendMessage(
                            sender,
                            {
                                text:
`⚠️ INVALID NAME

Please enter a valid name.

Example:
!name FLEXI SYSTEMS`
                            }
                        );

                        return;
                    }

                    const phone =
                        normalizePhone(
                            sender
                        );

                    console.log(
                        "📌 Saving profile for:",
                        phone
                    );

                    await db
                        .collection(
                            "users"
                        )
                        .doc(phone)
                        .set(
                            {
                                name:
                                    suppliedName,

                                phone:
                                    phone,

                                updatedAt:
                                    Date.now(),

                                createdAt:
                                    Date.now()
                            },
                            {
                                merge:
                                    true
                            }
                        );

                    console.log(
                        "✅ Profile saved for:",
                        phone
                    );

                    await sock.sendMessage(
                        sender,
                        {
                            text:
`✅ PROFILE REGISTERED SUCCESSFULLY 🎓

Thank you, your name has been saved as:

${suppliedName.toUpperCase()}

🚀 You can now type:

!pay month
or
!pay week`
                        }
                    );

                } catch (
                    error
                ) {

                    console.log(
                        "❌ Name registration FULL ERROR:",
                        error
                    );

                    await sock.sendMessage(
                        sender,
                        {
                            text:
`❌ PROFILE REGISTRATION FAILED

Please try again later.`
                        }
                    );
                }
            }

        } // END messages.upsert
    );
} // END startJARVIS



// =====================================
// DASHBOARD ROUTES
// =====================================
const dashboardRoutes =
    require(
        './routes/dashboard'
    );

dashboardRoutes(
    app,
    sock,
    firebaseConfig
);


// =====================================
// WEBHOOK QUIZ ROUTE
// =====================================
app.post(
    '/webhook/trigger-quiz',
    async (
        req,
        res
    ) => {

        try {

            const {
                subject,
                quizText,
                answers
            } = req.body;

            if (
                !subject ||
                !answers
            ) {

                return res
                    .status(
                        400
                    )
                    .json({
                        success:
                            false,

                        error:
"Incomplete quiz data payload"
                    });
            }

            const trigger =
                await quizEngine
                    .fireQuiz(
                        sock,
                        {
                            subject,
                            quizText,
                            answers
                        }
                    );

            if (
                trigger.success
            ) {

                res.json({
                    success:
                        true,

                    message:
"Quiz pushed to group successfully"
                });

            } else {

                res.status(
                    500
                ).json({
                    success:
                        false,

                    error:
                        trigger.error
                });
            }

        } catch (
            err
        ) {

            res.status(
                500
            ).json({
                success:
                    false,

                error:
                    err.message
            });
        }
    }
);


// =====================================
// PAYMENT SUCCESS ROUTE
// =====================================
app.post(
    "/payment-success",
    async (
        req,
        res
    ) => {

        try {

            const {
                phone,
                plan
            } = req.body;

            if (!phone) {

                return res
                    .status(
                        400
                    )
                    .json({
                        success:
                            false,

                        message:
"Missing phone details parameters."
                    });
            }

            const studentJid =
`${phone}@s.whatsapp.net`;

            const paidClassGroupLink =
"https://chat.whatsapp.com/JC7W3YORbIr4GtoktECpaU";

            const activationNotice =
`🎉 *FLEXI TUTORS PAYSTACK COMPLIANCE* 🎓

Hello @${phone}, your payment for *${plan}* was successful!

👇 Paid Lectures Group:
${paidClassGroupLink}

Welcome aboard 🚀`;

            await sock.sendMessage(
                studentJid,
                {
                    text:
                        activationNotice,

                    mentions:
                        [
                            studentJid
                        ]
                }
            );

            console.log(
                `🚀 Access sent to ${phone}`
            );

            return res.json({
                success:
                    true,

                message:
"Group link dropped successfully."
            });

        } catch (
            err
        ) {

            console.error(
                "❌ Payment callback error:",
                err.message
            );

            return res
                .status(
                    500
                )
                .json({
                    success:
                        false,

                    error:
                        err.message
                });
        }
    }
);


// =====================================
// START SERVER
// =====================================
app.listen(
    port,
    () => {

        console.log(
`Server running on ${port}`
        );

        startJARVIS();
    }
);
