module.exports = async ({
    sock,
    m,
    text
}) => {

    try {

        if (!text) return;

        const lower =
            text.toLowerCase();

        // =============================================
        // AI KEYWORDS
        // =============================================

        const triggers = [

            "jarvis",
            "flexi ai",
            "@ai"
        ];

        const matched =
            triggers.some(word =>
                lower.includes(word)
            );

        if (!matched) return;

        // =============================================
        // REACT
        // =============================================

        await sock.sendMessage(

            m.key.remoteJid,

            {
                react: {

                    text: "🤖",

                    key: m.key
                }
            }
        );

    } catch (err) {

        console.log(
            "❌ Reaction Handler:",
            err.message
        );
    }
};
