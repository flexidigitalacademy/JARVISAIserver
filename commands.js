const axios = require('axios');

module.exports = async (
    sock, m, command, args, jid, sender, isStaff, 
    Warn, activityTracker, askAI, downloadMedia, 
    metadata, BOT_NAME, POWERED_BY, OWNER_NUMBER
) => {

    // 1. PUBLIC COMMANDS (Non-Staff)
    // You can keep these here or in index.js, but including them makes
    // the command system truly modular.
    if (command === "!getjid") {
        return sock.sendMessage(jid, { text: `🎯 This group's JID is:\n\n*${jid}*` }, { quoted: m });
    }

    if (command === "!ginfo") {
        return sock.sendMessage(jid, {
            text: `*📊 ${BOT_NAME} REPORT*\n\nGroup: ${metadata?.subject}\nMembers: ${metadata?.participants?.length}\nPowered by: ${POWERED_BY}`
        });
    }

    if (command === "!listonline") {
        if (!metadata) return;
        const activeThreshold = 30 * 60 * 1000;
        let activeCount = 0;
        metadata.participants.forEach(p => {
            if (activityTracker.has(p.id) && (Date.now() - activityTracker.get(p.id) < activeThreshold)) {
                activeCount++;
            }
        });
        return sock.sendMessage(jid, {
            text: `*📊 ACTIVITY REPORT*\n\n🟢 Active: ${activeCount}\n👻 Ghosts: ${metadata.participants.length - activeCount}`
        });
    }

    // 2. STAFF-ONLY COMMANDS
    if (!isStaff) return;

    try {
        switch (command) {
            case "!ai":
                const prompt = args.join(" ");
                const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
                const isQuotedImage = quoted?.imageMessage;
                const isDirectImage = m.message.imageMessage;

                if (!prompt && !isDirectImage && !isQuotedImage) {
                    return sock.sendMessage(jid, { text: "Oya, what is your question? You can also send an image." });
                }

                await sock.sendPresenceUpdate('composing', jid);
                let base64Image = null;

                if (isDirectImage || isQuotedImage) {
                    await sock.sendMessage(jid, { react: { key: m.key, text: "📸" } });
                    const mediaMessage = isDirectImage ? m.message : quoted;
                    try {
                        const buffer = await downloadMedia(mediaMessage);
                        base64Image = buffer.toString('base64');
                    } catch (err) { console.log("Media Error:", err.message); }
                }

                const aiReply = await askAI(prompt || "Analyze this image clearly.", base64Image);
                return sock.sendMessage(jid, { text: `🤖 *JARVIS AI*\n\n${aiReply}` });

            case "!kick":
            case "!promote":
                let target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message.extendedTextMessage?.contextInfo?.participant;
                if (!target && args[0]) target = args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                if (!target || target.includes(OWNER_NUMBER)) return sock.sendMessage(jid, { text: "❌ Target invalid." });

                const action = command === "!kick" ? "remove" : "promote";
                try {
                    await sock.groupParticipantsUpdate(jid, [target], action);
                    await sock.sendMessage(jid, { text: `✅ Successfully ${action === "remove" ? "removed" : "promoted"}.` });
                } catch (err) {
                    await sock.sendMessage(jid, { text: "❌ Failed. Am I admin?" });
                }
                break;

            case "!image":
                const imgPrompt = args.join(" ");
                if (!imgPrompt) return sock.sendMessage(jid, { text: "❌ Provide a prompt" });
                await sock.sendMessage(jid, { react: { key: m.key, text: "🎨" } });
                try {
                    const res = await axios.get(`https://flexieduconsult-ai-link-z60r.onrender.com/image?prompt=${encodeURIComponent(imgPrompt)}`);
                    if (res.data?.success) {
                        await sock.sendMessage(jid, { image: { url: res.data.image }, caption: `🖌️ *JARVIS AI ART*\nPrompt: ${imgPrompt}` });
                    }
                } catch (err) {
                    await sock.sendMessage(jid, { text: "⚠️ Image generation failed" });
                }
                break;

            case "!mute":
            case "!unmute":
                const duration = args[0];
                const unit = args[1]?.toLowerCase();
                const muteAction = command === "!mute" ? 'announcement' : 'not_announcement';
                const statusText = command === "!mute" ? "🔒 Group Locked" : "🔓 Group Unlocked";

                if (!duration || isNaN(duration)) {
                    await sock.groupSettingUpdate(jid, muteAction);
                    return sock.sendMessage(jid, { text: statusText });
                }

                let ms;
                switch (unit) {
                    case 'sec': case 's': ms = duration * 1000; break;
                    case 'min': case 'm': ms = duration * 60 * 1000; break;
                    case 'hr': case 'h': ms = duration * 60 * 60 * 1000; break;
                    default: return sock.sendMessage(jid, { text: `❌ Use: ${command} [number] [sec/min/hr]` });
                }

                await sock.groupSettingUpdate(jid, muteAction);
                setTimeout(async () => {
                    const reverse = muteAction === 'announcement' ? 'not_announcement' : 'announcement';
                    await sock.groupSettingUpdate(jid, reverse);
                    await sock.sendMessage(jid, { text: "🔄 Auto-reversed group setting" });
                }, ms);
                break;

            case "!add":
                let addTarget = args[0]?.replace(/[^0-9]/g, '');
                if (!addTarget) return sock.sendMessage(jid, { text: "❌ Provide number e.g. !add 08012345678" });
                if (addTarget.startsWith('0')) addTarget = '234' + addTarget.slice(1);
                const targetJid = addTarget + "@s.whatsapp.net";

                try {
                    const res = await sock.groupParticipantsUpdate(jid, [targetJid], "add");
                    const status = res?.[0]?.status;
                    if (status === "200") await sock.sendMessage(jid, { text: `✅ Added @${addTarget}`, mentions: [targetJid] });
                    else if (status === "403") await sock.sendMessage(jid, { text: "⚠️ Privacy restriction" });
                    else if (status === "409") await sock.sendMessage(jid, { text: "ℹ️ Already in group" });
                    else await sock.sendMessage(jid, { text: "❌ Failed to add user" });
                } catch (err) { await sock.sendMessage(jid, { text: "❌ Error: Am I admin?" }); }
                break;

            case "!reset":
                const resetTarget = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (!resetTarget) return sock.sendMessage(jid, { text: "❌ Tag someone to reset warnings" });
                await Warn.deleteOne({ userId: resetTarget });
                await sock.sendMessage(jid, { text: `✅ Strikes cleared for @${resetTarget.split('@')[0]}`, mentions: [resetTarget] });
                break;
        }
    } catch (err) {
        console.error("❌ Command Execution Error:", err);
    }
};
  
