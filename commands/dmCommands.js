// =====================================================
// FILE: commands/dmCommands.js
// =====================================================

module.exports = async (ctx) => {

    try {

        const {
            sock,
            jid,
            text
        } = ctx;

        if (!text) return;

        const command =
            text
                .split(" ")[0]
                .toLowerCase();

        // =============================================
        // DM ONLY
        // =============================================

        const isDM =
            jid.endsWith("@s.whatsapp.net");

        if (!isDM) return;

        // =============================================
        // !PAY
        // =============================================

        if (command === "!pay") {

            return await sock.sendMessage(

                jid,

                {
                    text:
`💳 *FLEXI DIGITAL ACADEMY PAYMENT DETAILS*

🏦 Bank:
OPay

👤 Account Name:
Flexi Digital Academy

🔢 Account Number:
XXXXXXXXXX

📌 Send proof after payment.`
                }
            );
        }

        // =============================================
        // !NAME
        // =============================================

        if (command === "!name") {

            return await sock.sendMessage(

                jid,

                {
                    text:
`🤖 *BOT INFORMATION*

Name:
JARVIS AI

Organization:
Flexi Digital Academy`
                }
            );
        }

        // =============================================
        // !PLAYMUSIC
        // =============================================

        if (command === "!playmusic") {

            const song =
                text.replace(
                    /!playmusic/i,
                    ""
                ).trim();

            if (!song) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
`⚠️ Example:

!playmusic believer`
                    }
                );
            }

            return await sock.sendMessage(

                jid,

                {
                    text:
`🎵 Music search is currently under development.

Requested:
${song}`
                }
            );
        }

        // =============================================
        // !QUIZ
        // =============================================

        if (command === "!quiz") {

            return await sock.sendMessage(

                jid,

                {
                    text:
`🧠 *QUIZ SYSTEM*

Quiz feature is currently active in groups only.

Join your tutorial group to participate.`
                }
            );
        }

    } catch (err) {

        console.log(
            "❌ DM Commands:",
            err.message
        );
    }
};
