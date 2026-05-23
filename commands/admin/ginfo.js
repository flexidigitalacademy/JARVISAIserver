module.exports = async ({
    sock,
    jid
}) => {

    try {

        const metadata =
            await sock.groupMetadata(
                jid
            );

        const admins =
            metadata.participants
                .filter(p => p.admin);

        const members =
            metadata.participants.length;

        const text =
`📊 *GROUP INFO*

📝 Name:
${metadata.subject}

👥 Members:
${members}

👑 Admins:
${admins.length}

🆔 Group ID:
${jid}`;

        await sock.sendMessage(

            jid,

            {
                text
            }
        );

    } catch (err) {

        console.log(
            "❌ GInfo:",
            err.message
        );
    }
};
