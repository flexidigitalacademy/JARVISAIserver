const axios = require("axios");

module.exports = async ({
    sock,
    m,
    text,
    jid
}) => {

    try {

        if (!text) return;

        const lower =
            text.toLowerCase();

        // =================================================
        // !PING
        // =================================================

        if (lower === "!ping") {

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "🏓 Pong!"
                }
            );
        }

        // =================================================
        // !IMAGE
        // =================================================

        if (lower.startsWith("!image")) {

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
                            "⚠️ Give an image prompt."
                    }
                );
            }

            // =============================================
            // REACTION
            // =============================================

            await sock.sendMessage(

                jid,

                {
                    react: {

                        text: "🎨",

                        key: m.key
                    }
                }
            );

            // =============================================
            // IMAGE URL
            // =============================================

            const imageUrl =
`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

            // =============================================
            // SEND IMAGE
            // =============================================

            return await sock.sendMessage(

                jid,

                {
                    image: {
                        url: imageUrl
                    },

                    caption:
`🖼️ Generated Image

Prompt:
${prompt}`
                }
            );
        }

    } catch (err) {

        console.log(
            "❌ Command Handler:",
            err.message
        );
    }
};
