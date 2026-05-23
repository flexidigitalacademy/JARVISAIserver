const onlineUsers =
new Map();

// =====================================================
// TRACK ONLINE ACTIVITY
// =====================================================

function updateOnline(sender) {

    onlineUsers.set(
        sender,
        Date.now()
    );
}

// =====================================================
// COMMAND
// =====================================================

async function listOnline({
    sock,
    jid
}) {

    try {

        let text =
`🟢 *RECENTLY ACTIVE USERS*

`;

        let count = 0;

        for (const [id, time] of onlineUsers) {

            const diff =
                Math.floor(
                    (Date.now() - time) / 1000
                );

            if (diff < 300) {

                count++;

                text +=
`${count}. @${
id.split("@")[0]
}
`;
            }
        }

        if (!count) {

            text +=
"Nobody recently active.";
        }

        await sock.sendMessage(

            jid,

            {
                text,

                mentions:
                    [...onlineUsers.keys()]
            }
        );

    } catch (err) {

        console.log(
            "❌ listonline:",
            err.message
        );
    }
}

module.exports = {

    listOnline,
    updateOnline
};
