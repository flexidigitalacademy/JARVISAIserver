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

                const ctx = {

                    sock,
                    m,
                    jid,
                    sender,
                    text
                };

                // =============================================
                // RUN HANDLERS
                // =============================================

                await moderationHandler(ctx);

                await mediaHandler(ctx);

                await reactionHandler(ctx);

                await commandHandler(ctx);

                await aiHandler(ctx);

            } catch (err) {

                console.log(
                    "❌ Message Handler Error:",
                    err.message
                );
            }
        }
    );
};
