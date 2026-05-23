module.exports = async ({
    sock,
    jid
}) => {

    try {

        await sock.sendMessage(

            jid,

            {
                text:
`🆔 GROUP JID

${jid}`
            }
        );

    } catch (err) {

        console.log(
            "❌ getJID:",
            err.message
        );
    }
};
