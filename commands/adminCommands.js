// =====================================================
// FILE: commands/adminCommands.js
// =====================================================

const axios = require("axios");

// =====================================================
// ONLINE TRACKER
// =====================================================

const onlineUsers =
new Map();

function updateOnline(sender){

    onlineUsers.set(
        sender,
        Date.now()
    );
}

// =====================================================
// ADMIN COMMANDS
// =====================================================

module.exports = async (ctx) => {

    try {

        const {
            sock,
            jid,
            sender,
            text,
            m
        } = ctx;

        if (!text) return;

        const command =
            text
                .split(" ")[0]
                .toLowerCase();

        // =============================================
        // GROUP ONLY
        // =============================================

        const isGroup =
            jid.endsWith("@g.us");

        if (!isGroup) return;

        // =============================================
        // ADMIN CHECK
        // =============================================

        const metadata =
            await sock.groupMetadata(
                jid
            );

        const admins =
            metadata.participants
                .filter(p => p.admin)
                .map(p => p.id);

        const isAdmin =
            admins.includes(sender);

        if (!isAdmin) return;

        // =============================================
        // !PING
        // =============================================

        if (command === "!ping") {

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "🏓 Pong!"
                }
            );
        }

        // =============================================
        // !AI
        // =============================================

        if (command === "!ai") {

            const prompt =
                text.replace(
                    /!ai/i,
                    ""
                ).trim();

            if (!prompt) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
`⚠️ Example:

!ai Explain photosynthesis`
                    }
                );
            }

            await sock.sendMessage(

                jid,

                {
                    react: {

                        text: "🧠",

                        key: m.key
                    }
                }
            );

            const response =
                await axios.post(

                    process.env.AI_SERVER,

                    {
                        prompt
                    },

                    {
                        timeout: 60000
                    }
                );

            const reply =

                response.data?.result ||

                "⚠️ AI unavailable.";

            return await sock.sendMessage(

                jid,

                {
                    text: reply
                }
            );
        }

        // =============================================
        // !IMAGE
        // =============================================

        if (command === "!image") {

            const prompt =
                text.replace(
                    /!image/i,
                    ""
                ).trim();

            if (!prompt) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
`⚠️ Example:

!image futuristic lion`
                    }
                );
            }

            await sock.sendMessage(

                jid,

                {
                    react: {

                        text: "🎨",

                        key: m.key
                    }
                }
            );

            const imageUrl =
`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

            return await sock.sendMessage(

                jid,

                {
                    image: {
                        url: imageUrl
                    },

                    caption:
`🖼️ Generated Image

🎯 Prompt:
${prompt}`
                }
            );
        }

        // =============================================
        // !GINFO
        // =============================================

        if (command === "!ginfo") {

            const members =
                metadata.participants.length;

            return await sock.sendMessage(

                jid,

                {
                    text:
`📊 *GROUP INFO*

📝 Name:
${metadata.subject}

👥 Members:
${members}

👑 Admins:
${admins.length}

🆔 Group ID:
${jid}`
                }
            );
        }

        // =============================================
        // !GETJID
        // =============================================

        if (command === "!getjid") {

            return await sock.sendMessage(

                jid,

                {
                    text:
`🆔 GROUP JID

${jid}`
                }
            );
        }

        // =============================================
        // !LISTONLINE
        // =============================================

        if (command === "!listonline") {

            let msg =
`🟢 *RECENTLY ACTIVE USERS*

`;

            let count = 0;

            for (
                const [id, time]
                of onlineUsers
            ) {

                const diff =
                    Math.floor(

                        (
                            Date.now() -
                            time
                        ) / 1000
                    );

                if (diff < 300) {

                    count++;

                    msg +=
`${count}. @${
id.split("@")[0]
}
`;
                }
            }

            if (!count) {

                msg +=
"Nobody recently active.";
            }

            return await sock.sendMessage(

                jid,

                {
                    text: msg,

                    mentions:
                        [...onlineUsers.keys()]
                }
            );
        }

        // =============================================
        // !KICK
        // =============================================

        if (command === "!kick") {

            const mentioned =
                m.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid?.[0];

            if (!mentioned) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
                            "⚠️ Mention a user to kick."
                    }
                );
            }

            await sock.groupParticipantsUpdate(

                jid,

                [mentioned],

                "remove"
            );

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "✅ User removed."
                }
            );
        }

        // =============================================
        // !PROMOTE
        // =============================================

        if (command === "!promote") {

            const mentioned =
                m.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid?.[0];

            if (!mentioned) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
                            "⚠️ Mention a user."
                    }
                );
            }

            await sock.groupParticipantsUpdate(

                jid,

                [mentioned],

                "promote"
            );

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "✅ User promoted."
                }
            );
        }

        // =============================================
        // !DEMOTE
        // =============================================

        if (command === "!demote") {

            const mentioned =
                m.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.mentionedJid?.[0];

            if (!mentioned) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
                            "⚠️ Mention a user."
                    }
                );
            }

            await sock.groupParticipantsUpdate(

                jid,

                [mentioned],

                "demote"
            );

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "✅ User demoted."
                }
            );
        }

        // =============================================
        // !ADD
        // =============================================

        if (command === "!add") {

            const number =
                text
                    .replace(
                        /!add/i,
                        ""
                    )
                    .replace(/\D/g, "");

            if (!number) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
                            "⚠️ Provide number."
                    }
                );
            }

            const user =
`${number}@s.whatsapp.net`;

            await sock.groupParticipantsUpdate(

                jid,

                [user],

                "add"
            );

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "✅ User added."
                }
            );
        }

        // =============================================
        // !MUTE
        // =============================================

        if (command === "!mute") {

            await sock.groupSettingUpdate(

                jid,

                "announcement"
            );

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "🔇 Group muted."
                }
            );
        }

        // =============================================
        // !UNMUTE
        // =============================================

        if (command === "!unmute") {

            await sock.groupSettingUpdate(

                jid,

                "not_announcement"
            );

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "🔊 Group unmuted."
                }
            );
        }

        // =============================================
        // !RESET
        // =============================================

        if (command === "!reset") {

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "✅ User warnings reset."
                }
            );
        }

    } catch (err) {

        console.log(
            "❌ Admin Commands:",
            err.message
        );
    }
};

// =====================================================
// EXPORT ONLINE TRACKER
// =====================================================

module.exports.updateOnline =
updateOnline;
