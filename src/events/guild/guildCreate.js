const { EmbedBuilder } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");
const moment = require("moment");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
function checkDays(date) {
    let now = new Date();
    let diff = now.getTime() - date.getTime();
    let days = Math.floor(diff / 86400000);
    return days + (days === 1 ? " day" : " days") + " ago";
}
module.exports = async (client, guild) => {


    const joineddiscord =
        `${guild.createdAt.getDate()}/${guild.createdAt.getMonth() + 1}/${guild.createdAt.getFullYear()} • ${guild.createdAt.getHours()}:${guild.createdAt.getMinutes()}:${guild.createdAt.getSeconds()}`;

    if (!guild.available) return;

    // טוען את הבעלים אם אינו קיים בזיכרון
    if (!guild.members.cache.has(guild.ownerId)) await guild.fetchOwner({ cache: true }).catch(() => { });

    client.logger.log(`Guild Joined: ${guild.name} Members: ${guild.memberCount}`);
    await registerGuild(guild);

    if (!client.joinLeaveWebhook) return;

    // יצירת ה-embed
    const embed = new EmbedBuilder()
        .setTitle("**Joined a Server!**")
        .setThumbnail(guild.iconURL())
            // .setColor(client.config.EMBED_COLORS.SUCCESS)
            .setColor("#6679ff") // צבע לפי בעל השרת או כחול ברירת מחדל
       /* .addFields(
            {
                name: "Guild Name",
                value: guild.name,
                inline: false,
            },
            {
                name: "ID",
                value: guild.id,
                inline: false,
            },
            {
                name: "Owner",
                value: `${client.users.cache.get(guild.ownerId).tag} [\`${guild.ownerId}\`]`,
                inline: false,
            },
            {
                name: "Members",
                value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
                inline: false,
            }
        )
        .setFooter({ text: `Guild #${client.guilds.cache.size}` });*/
        .setAuthor({ name: `${client.guilds.cache.size} Servers`, iconURL: client.user.displayAvatarURL() })
        .setDescription(`**New Server Joined!**
**Guild Name:** ${guild.name}
**Users:** ${guild.memberCount}
**Owner:** ${guild.ownerId.tag} (${guild.ownerId})
**Owner ID:** ${guild.ownerId}`)
        .addFields({
            name: "Guild Created:",
            value: `${joineddiscord} **(${moment(guild.createdAt).fromNow()})**`,
            inline: false,
        })
        .setFooter({ text: `Guild ID: ${guild.id}` })
        .setTimestamp();


    // שליחת ה-embed לערוץ הווב הוק
    await client.joinLeaveWebhook.send({
        username: "Join",
        avatarURL: client.user.displayAvatarURL(),
        embeds: [embed],
    });

    // קביעת ערוץ ברירת מחדל
    let defaultChannel = "";

    // חפש ערוץ טקסט ברירת מחדל
    client.logger.log(`Checking channels in guild: ${guild.name}`);
    guild.channels.cache.forEach((channel) => {
    //    client.logger.log(`Channel: ${channel.name}, Type: ${channel.type}`);

        // ודא שהערוץ הוא סוג טקסט
       // if (channel.type === 0 && defaultChannel === "") {
            if (channel.type === 0 && defaultChannel === "") { // שימוש בשיטה isText()
                const permissions = channel.permissionsFor(guild.members.me); // שינוי ל-guild.members.me

                // בדוק אם permissions הוא לא null
                if (permissions) {
                    client.logger.log(`Permissions for ${channel.name}: SEND_MESSAGES: ${permissions.has("SEND_MESSAGES")}, VIEW_CHANNEL: ${permissions.has("VIEW_CHANNEL")}`);

                    // בדוק אם יש לבוט את ההרשאות הנדרשות
                    if (permissions.has("SEND_MESSAGES") && permissions.has("VIEW_CHANNEL")) {
                        defaultChannel = channel; // קבע את ערוץ ברירת המחדל
                    }
                } else {
                    client.logger.warn(`Could not retrieve permissions for channel: ${channel.name}`);
                }
            }
        });


    const joinEmbed = new EmbedBuilder() // שינוי ל-EmbedBuilder
        .setTitle('✨ Thank You for Adding Me! ✨')
        .setColor('#3498DB') // צבע כחול זוהר
        .setDescription("My prefix is `n!`, and I support **slash commands** too! Try `/help` or `n!help` for command options! 💡")
        .addFields( // השתמש ב-addFields במקום addField
            { name: '🎉 Get Started', value: 'Type `/help` or `n!help` to see the commands. 📝' },
            { name: '🚀 Explore Features', value: 'Use the menu to choose categories for specific commands! 🌟' },
            { name: '💎 Upgrade to Premium!', value: 'For exclusive features, consider upgrading! Type `/premium` for details.' }
        )
        .setThumbnail(client.user.displayAvatarURL()) // הוספת תמונת פרופיל של הבוט
        .setFooter({ text: 'Let\'s make your server awesome! 🎊', iconURL: client.user.displayAvatarURL() }); // עדכן את setFooter לשימוש נכון

    if (defaultChannel) {
        try {
            //    await defaultChannel.send("Hello! Thanks for adding me to the server! 🎉");
            await defaultChannel.send({ embeds: [joinEmbed] }); // שלח את ההודעה עם ה-embed
            client.logger.log(`Sent message to default channel: ${defaultChannel.name}`);
        } catch (error) {
            client.logger.error(`Failed to send message to ${defaultChannel.name}: ${error.message}`);
        }
    } else {
        client.logger.warn("No default channel found or bot lacks permissions.");
    }
};
