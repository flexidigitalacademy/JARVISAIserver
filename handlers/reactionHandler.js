// =====================================================
// FILE: handlers/reactionHandler.js
// =====================================================

module.exports = async ({
    sock,
    m,
    text,
    jid
}) => {

    try {

        if (!text) return;

        // =============================================
        // STOP BOT MESSAGES
        // =============================================

        if (
            m.key.fromMe
        ) return;

        // =============================================
        // STOP STATUS
        // =============================================

        if (
            jid === "status@broadcast"
        ) return;

        // =============================================
        // STOP COMMANDS
        // =============================================

        if (
            text.startsWith("!")
        ) return;

        // =============================================
        // STOP MEDIA
        // =============================================

        const isImage =
            !!m.message?.imageMessage;

        const isVideo =
            !!m.message?.videoMessage;

        const isSticker =
            !!m.message?.stickerMessage;

        const isDocument =
            !!m.message?.documentMessage;

        if (
            isImage ||
            isVideo ||
            isSticker ||
            isDocument
        ) return;

        // =============================================
        // LOWERCASE
        // =============================================

        const lower =
            text.toLowerCase();

        // =============================================
        // REACTION LOGIC
        // =============================================

        let emoji = null;

        // AI Name Mention
        if (
            lower.includes("jarvis") ||

            lower.includes("@ai")
        ) {

            emoji = "🤖";
        }

        // Greetings
        else if (
            lower.includes("good morning")
        ) {

            emoji = "🌞";
        }

        else if (
            lower.includes("good night")
        ) {

            emoji = "🌙";
        }

        // Appreciation
        else if (
            lower.includes("thanks") ||

            lower.includes("thank you")
        ) {

            emoji = "❤️";
        }

        // Surprise
        else if (
            lower.includes("wow")
        ) {

            emoji = "😮";
        }

        // =============================================
        // SEND REACTION
        // =============================================

        if (emoji) {

            await sock.sendMessage(

                jid,

                {
                    react: {

                        text: emoji,

                        key: m.key
                    }
                }
            );
        }

    } catch (err) {

        console.log(
            "❌ Reaction Handler:",
            err.message
        );
    }
};
