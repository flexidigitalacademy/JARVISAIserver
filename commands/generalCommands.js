// =====================================================
// FILE: commands/generalCommands.js
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
        // GROUP ONLY
        // =============================================

        const isGroup =
            jid.endsWith("@g.us");

        if (!isGroup) return;

        // =============================================
        // !MENU
        // =============================================

        if (command === "!menu") {

            const menu = `
╔══════════════════╗
   🤖 FLEXI AI MENU
╚══════════════════╝

✨ *GENERAL COMMANDS*
🔹 *!menu* - View bot menu
🔹 *!timetable* - Tutorial schedule
🔹 *!listadmins* - View admins

🛡️ *ADMIN COMMANDS*
🔸 *!ai [query]* - Ask AI
🔸 *!image [prompt]* - Generate image
🔸 *!ping* - Test bot speed
🔸 *!ginfo* - Group info
🔸 *!listonline* - Active users
🔸 *!add [number]* - Add member
🔸 *!kick @user* - Remove member
🔸 *!promote @user* - Make admin
🔸 *!demote @user* - Remove admin
🔸 *!mute* - Lock group
🔸 *!unmute* - Open group
🔸 *!reset @user* - Reset warnings
🔸 *!getjid* - Show group JID

💬 *DM COMMANDS*
🔹 *!pay*
🔹 *!name*
🔹 *!playmusic*
🔹 *!quiz*

🚫 *PROTECTIONS*
✅ Anti-Link
✅ Anti-Badword
✅ Anti-Status
✅ Welcome & Goodbye

━━━━━━━━━━━━━━━━━━━

📌 Flexi Digital Academy
`;

            return await sock.sendMessage(

                jid,

                {
                    text: menu
                }
            );
        }

        // =============================================
        // !LISTADMINS
        // =============================================

        if (command === "!listadmins") {

            const metadata =
                await sock.groupMetadata(
                    jid
                );

            const admins =
                metadata.participants
                    .filter(p => p.admin);

            if (!admins.length) {

                return await sock.sendMessage(

                    jid,

                    {
                        text:
                            "⚠️ No admins found."
                    }
                );
            }

            let msg =
`👑 *GROUP ADMINS*

`;

            admins.forEach((admin, i) => {

                const number =
                    admin.id
                        .split("@")[0];

                msg +=
`${i + 1}. @${number}
`;
            });

            return await sock.sendMessage(

                jid,

                {
                    text: msg,

                    mentions:
                        admins.map(a => a.id)
                }
            );
        }

        // =============================================
        // !TIMETABLE
        // =============================================

        if (command === "!timetable") {

            const imageUrl =
"https://your-image-link-here.jpg";

            return await sock.sendMessage(

                jid,

                {
                    image: {
                        url: imageUrl
                    },

                    caption:
`📚 *Latest Tutorial Timetable*

Powered by Flexi Digital Academy`
                }
            );
        }

    } catch (err) {

        console.log(
            "❌ General Commands:",
            err.message
        );
    }
};
