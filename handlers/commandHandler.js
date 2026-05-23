// =====================================================
// COMMAND GROUPS
// =====================================================

const adminCommands =
require("../commands/adminCommands");

const generalCommands =
require("../commands/generalCommands");

const dmCommands =
require("../commands/dmCommands");

// =====================================================
// COMMAND HANDLER
// =====================================================

module.exports = async (ctx) => {

    try {

        const {
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
        // RUN GENERAL COMMANDS
        // =============================================

        await generalCommands(
            ctx
        );

        // =============================================
        // RUN ADMIN COMMANDS
        // =============================================

        await adminCommands(
            ctx
        );

        // =============================================
        // RUN DM COMMANDS
        // =============================================

        await dmCommands(
            ctx
        );

    } catch(err){

        console.log(
            "❌ Command Handler:",
            err.message
        );
    }
};
