module.exports = async ({
    sock,
    text,
    jid
}) => {

    try {

        if (!text) return;

        const lower =
            text.toLowerCase();

        // =============================================
        // BANNED WORDS
        // =============================================

        const bannedWords = [

            "porn",
            "rape",
            "cp"
        ];

        const detected =
            bannedWords.some(word =>
                lower.includes(word)
            );

        if (!detected) return;

        // =============================================
        // WARNING
        // =============================================

        await sock.sendMessage(

            jid,

            {
                text:
                    "⚠️ Inappropriate content detected."
            }
        );

    } catch (err) {

        console.log(
            "❌ Moderation Handler:",
            err.message
        );
    }
};
