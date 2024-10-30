const { EmbedBuilder, ChannelType, AuditLogEvent } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Channel} channel
 */
module.exports = async (client, channel) => {
    // ודא שהחדר נוצר בשרת המסוים שאתה מעוניין בו
    const targetGuildId = "792778956230623287"; // הכנס כאן את ה-ID של השרת שבו אתה רוצה לעקוב
    if (channel.guild.id !== targetGuildId) return; // אם החדר לא נוצר בשרת הנבחר, חזור

    // בדוק אם החדר הוא חדר טקסט
//    if (channel.type !== ChannelType.GuildText) return;

  //  client.logger.log(`Channel Created: ${channel.name} in Guild: ${channel.guild.name}`);

    // רישום השרת
    await registerGuild(channel.guild);

    // ודא שיש לך Webhook מוגדר
    if (!client.nogalogs) return;

    // חפש את ה-Entry האחרון כדי לקבוע מי יצר את החדר
    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate, // השתמש במבנה הנכון כאן
    });

    const entry = fetchedLogs.entries.first();

    // קבע את שם היוצר או הצג הודעה חלופית
    const creatorInfo = entry ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown Creator";
    let channelType;
    switch (channel.type) {
        case ChannelType.GuildText:
            channelType = "Text Channel";
            break;
        case ChannelType.GuildVoice:
            channelType = "Voice Channel";
            break;
        case ChannelType.GuildCategory:
            channelType = "Category";
            break;
        case ChannelType.GuildNews:
            channelType = "News Channel";
            break;
        case ChannelType.GuildStore:
            channelType = "Store Channel";
            break;
        // הוסף כאן סוגים נוספים אם יש
        default:
            channelType = "Unknown Type";
            break;
    }
    // יצירת ה-embed
    const channelcembed = new EmbedBuilder()
        .setColor('#00A56A')
        .setAuthor({ name: `Channel Created`, iconURL: client.user.avatarURL() })
        .addFields(
            { name: "**Name:**", value: `${channel.name}`, inline: true },
            { name: "**Type:**", value: `${channelType}`, inline: true },
            // { name: "**Channel Topic:**", value: `\`${channel.topic === null ? "None" : channel.topic}\``, inline: true },
            { name: "**ID:**", value: `${channel.id}`, inline: true },
            { name: "**Created By:**", value: creatorInfo, inline: true } // השתמש במידע שנקבע למעלה
        )
        .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })
        .setTimestamp();

    // שלח את הלוג ל-WebHook
    client.nogalogs.send({
        username: "Channel Log",
        avatarURL: client.user.displayAvatarURL(),
        embeds: [channelcembed],
    });
};
