const pingCommand =
require("../commands/ping");

const imageCommand =
require("../commands/image");

const aiCommand =
require("../commands/ai");

const menuCommand =
require("../commands/menu");

// =====================================================
// GENERAL COMMANDS
// =====================================================

const listAdminsCommand =
require("../commands/general/listadmins");

// =====================================================
// ADMIN COMMANDS
// =====================================================

const ginfoCommand =
require("../commands/admin/ginfo");

const getJIDCommand =
require("../commands/admin/getJID");

const {
    listOnline
} = require(
    "../commands/admin/listonline"
);

// =====================================================
// COMMAND ROUTER
// =====================================================

module.exports = async (ctx) => {

    try {

        const {
            sock,
            jid,
            sender,
            text
        } = ctx;

        if (!text) return;

        // =============================================
        // PREFIX CHECK
        // =============================================

        if (
            !text.startsWith("!")
        ) return;

        // =============================================
        // BASIC INFO
        // =============================================

        const command =
            text
                .split(" ")[0]
                .toLowerCase();

        const isGroup =
            jid.endsWith("@g.us");

        const isDM =
            jid.endsWith("@s.whatsapp.net");

        // =============================================
        // GROUP ADMIN CHECK
        // =============================================

        let isAdmin = false;

        if (isGroup) {

            try {

                const metadata =
                    await sock.groupMetadata(
                        jid
                    );

                const admins =
                    metadata.participants
                        .filter(
                            p => p.admin
                        )
                        .map(
                            p => p.id
                        );

                isAdmin =
                    admins.includes(
                        sender
                    );

            } catch (err) {

                console.log(
                    "⚠️ Admin Check Failed:",
                    err.message
                );
            }
        }

        // =============================================
        // ROUTING
        // =============================================

        switch(command){

            // =========================================
            // BASIC
            // =========================================

            case "!ping":

                return await pingCommand(
                    ctx
                );

            // =========================================
            // AI
            // =========================================

            case "!ai":

                return await aiCommand(
                    ctx
                );

            case "!image":

                return await imageCommand(
                    ctx
                );

            // =========================================
            // GENERAL GROUP COMMANDS
            // =========================================

            case "!menu":

                if (!isGroup) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⚠️ This command works only in groups."
                        }
                    );
                }

                return await menuCommand(
                    ctx
                );

            case "!listadmins":

                if (!isGroup) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⚠️ Group only command."
                        }
                    );
                }

                return await listAdminsCommand(
                    ctx
                );

            // =========================================
            // ADMIN COMMANDS
            // =========================================

            case "!ginfo":

                if (!isGroup) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⚠️ Group only command."
                        }
                    );
                }

                if (!isAdmin) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⛔ Admin only command."
                        }
                    );
                }

                return await ginfoCommand(
                    ctx
                );

            case "!getjid":

                if (!isGroup) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⚠️ Group only command."
                        }
                    );
                }

                if (!isAdmin) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⛔ Admin only command."
                        }
                    );
                }

                return await getJIDCommand(
                    ctx
                );

            case "!listonline":

                if (!isGroup) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⚠️ Group only command."
                        }
                    );
                }

                if (!isAdmin) {

                    return await sock.sendMessage(

                        jid,

                        {
                            text:
                                "⛔ Admin only command."
                        }
                    );
                }

                return await listOnline(
                    ctx
                );

            // =========================================
            // UNKNOWN COMMAND
            // =========================================

            default:

                return await sock.sendMessage(

                    jid,

                    {
                        text:
`⚠️ Unknown command.

Type !menu`
                    }
                );
        }

    } catch(err){

        console.log(
            "❌ Command Router:",
            err.message
        );
    }
};
