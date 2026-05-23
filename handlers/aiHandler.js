const axios = require("axios");

module.exports = async ({
    sock,
    m,
    text,
    jid
}) => {

    try {

        if (!text) return;

        // =============================================
        // BLOCK COMMANDS
        // =============================================

        if (
            text.startsWith("!")
        ) return;

        const lower =
            text.toLowerCase();

        // =============================================
        // AI TRIGGERS
        // =============================================

        const isAiTrigger =

            lower.includes("jarvis") ||

            lower.includes("@ai");

        if (!isAiTrigger) return;

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
