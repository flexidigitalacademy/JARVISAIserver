const axios = require("axios");

module.exports = async ({
    sock,
    m,
    text,
    jid,
    sender
}) => {

    try {

        if (!text) return;

        // =============================================
        // STOP COMMANDS
        // =============================================

        if (
            text.startsWith("!")
        ) return;

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
        // STOP MEDIA AUTO-REPLIES
        // =============================================

        const isImage =
            !!m.message?.imageMessage;

        const isVideo =
            !!m.message?.videoMessage;

        const isSticker =
            !!m.message?.stickerMessage;

        const isDocument =
            !!m.message?.documentMessage;

        // Ignore media completely
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
        // AI TRIGGERS
        // =============================================

        const isAiTrigger =

            lower.includes("jarvis") ||

            lower.startsWith("ai ") ||

            lower.includes("@ai");

        if (!isAiTrigger) return;

        // =============================================
        // IGNORE SHORT TRIGGERS
        // =============================================

        if (
            text.trim().length < 4
        ) return;

        // =============================================
        // REACTION
        // =============================================

        await sock.sendMessage(

            jid,

            {
                react: {

                    text: "🧠",

                    key: m.key
                }
            }
        );

        // =============================================
        // AI REQUEST
        // =============================================

        const response =
            await axios.post(

                process.env.AI_SERVER,

                {
                    prompt: text
                },

                {
                    timeout: 60000
                }
            );

        const reply =

            response.data?.result ||

            "⚠️ AI service unavailable.";

        // =============================================
        // VALIDATE RESPONSE
        // =============================================

        if (
            !reply ||
            typeof reply !== "string"
        ) {

            return;
        }

        // =============================================
        // SEND RESPONSE
        // =============================================

        await sock.sendMessage(

            jid,

            {
                text: reply
            }
        );

    } catch (err) {

        console.log(
            "❌ AI Handler:",
            err.response?.data ||
            err.message
        );
    }
};
