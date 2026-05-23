// =====================================================
// FILE: handlers/watchdogHandler.js
// =====================================================

const badWords = [

    "fuck",
    "bastard",
    "idiot",
    "mumu",
    "fool"
];

// =====================================================
// WATCHDOG
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

        // =============================================
        // GROUP ONLY
        // =============================================

        const isGroup =
            jid.endsWith("@g.us");

        if (!isGroup) return;

        // =============================================
        // GROUP METADATA
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

        // =============================================
        // IGNORE ADMINS
        // =============================================

        if (isAdmin) return;

        // =============================================
        // ANTI-LINK
        // =============================================

        const containsLink =

            text.includes("http://") ||

            text.includes("https://") ||

            text.includes("chat.whatsapp.com");

        if (containsLink) {

            try {

                await sock.sendMessage(

                    jid,

                    {
                        delete: m.key
                    }
                );

                await sock.sendMessage(

                    jid,

                    {
                        text:
`🚫 Links are not allowed.

@${sender.split("@")[0]}`,

                        mentions: [sender]
                    }
                );

            } catch {}
        }

        // =============================================
        // ANTI-BADWORD
        // =============================================

        const lower =
            text.toLowerCase();

        const foundBadWord =
            badWords.some(word =>
                lower.includes(word)
            );

        if (foundBadWord) {

            try {

                await sock.sendMessage(

                    jid,

                    {
                        delete: m.key
                    }
                );

                await sock.sendMessage(

                    jid,

                    {
                        text:
`⚠️ Bad words are not allowed.

@${sender.split("@")[0]}`,

                        mentions: [sender]
                    }
                );

            } catch {}
        }

    } catch (err) {

        console.log(
            "❌ Watchdog:",
            err.message
        );
    }
};
