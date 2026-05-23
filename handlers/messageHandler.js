const reactionHandler =
require("./reactionHandler");

const commandHandler =
require("./commandHandler");

const aiHandler =
require("./aiHandler");

const mediaHandler =
require("./mediaHandler");

const moderationHandler =
require("./moderationHandler");

const watchdogHandler =
require("./watchdogHandler");

const {
    updateOnline
} = require(
    "../commands/adminCommands"
);

// =====================================================
// TEXT EXTRACTOR
// =====================================================

function extractText(m) {

    return (

        m.message?.conversation ||

        m.message?.extendedTextMessage?.text ||

        m.message?.imageMessage?.caption ||

        m.message?.videoMessage?.caption ||

        m.message?.documentMessage?.caption ||

        ""

    ).trim();
}

// =====================================================
// MAIN MESSAGE HANDLER
// =====================================================

module.exports = (sock) => {

    sock.ev.on(

        "messages.upsert",

        async ({ messages }) => {

            try {

                const m = messages[0];

                if (!m) return;

                if (!m.message) return;

                // =============================================
                // STOP RECURSION
                // =============================================

                if (m.key.fromMe) return;

                // =============================================
                // BASIC INFO
                // =============================================

                const jid =
                    m.key.remoteJid;

                const sender =
                    m.key.participant ||
                    jid;

                const text =
                    extractText(m);

                // =============================================
                // UPDATE ONLINE TRACKER
                // =============================================

                updateOnline(sender);

                // =============================================
                // CONTEXT
                // =============================================

                const ctx = {

                    sock,
                    m,
                    jid,
                    sender,
                    text
                };

                // =============================================
                // WATCHDOG PROTECTION
                // =============================================

                await watchdogHandler(
                    ctx
                );

                // =============================================
                // MODERATION
                // =============================================

                await moderationHandler(
                    ctx
                );

                // =============================================
                // MEDIA
                // =============================================

                await mediaHandler(
                    ctx
                );

                // =============================================
                // REACTIONS
                // =============================================

                await reactionHandler(
                    ctx
                );

                // =============================================
                // COMMANDS
                // =============================================

                await commandHandler(
                    ctx
                );

                // =============================================
                // AI CHAT
                // =============================================

                await aiHandler(
                    ctx
                );

            } catch (err) {

                console.log(
                    "❌ Message Handler Error:",
                    err.message
                );
            }
        }
    );
};
