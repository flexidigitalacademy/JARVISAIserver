module.exports = async ({
    m
}) => {

    try {

        const hasImage =
            !!m.message?.imageMessage;

        const hasVideo =
            !!m.message?.videoMessage;

        const hasDocument =
            !!m.message?.documentMessage;

        if (
            !hasImage &&
            !hasVideo &&
            !hasDocument
        ) {

            return;
        }

        console.log(
            "📦 Media detected"
        );

    } catch (err) {

        console.log(
            "❌ Media Handler:",
            err.message
        );
    }
};
