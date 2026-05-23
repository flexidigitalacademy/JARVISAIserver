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

        if (!admins.length) {

            return await sock.sendMessage(

                jid,

                {
                    text:
                        "⚠️ No admins found."
                }
            );
        }

        let text =
`👑 *GROUP ADMINS*

`;

        admins.forEach((admin, i) => {

            const number =
                admin.id
                    .split("@")[0];

            text +=
`${i + 1}. @${number}
`;
        });

        await sock.sendMessage(

            jid,

            {
                text,

                mentions:
                    admins.map(a => a.id)
            }
        );

    } catch (err) {

        console.log(
            "❌ ListAdmins:",
            err.message
        );
    }
};
