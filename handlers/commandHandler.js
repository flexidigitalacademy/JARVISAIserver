const pingCommand =
require("../commands/ping");

const imageCommand =
require("../commands/image");

const aiCommand =
require("../commands/ai");

const menuCommand =
require("../commands/menu");

// =====================================================
// COMMAND ROUTER
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

        const command =
            text
                .split(" ")[0]
                .toLowerCase();

        // =============================================
        // ROUTING
        // =============================================

        switch(command){

            case "!ping":

                return await pingCommand(
                    ctx
                );

            case "!image":

                return await imageCommand(
                    ctx
                );

            case "!ai":

                return await aiCommand(
                    ctx
                );

            case "!menu":

                return await menuCommand(
                    ctx
                );

            default:
                return;
        }

    } catch(err){

        console.log(
            "❌ Command Router:",
            err.message
        );
    }
};
