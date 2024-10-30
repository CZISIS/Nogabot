const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ApplicationCommandOptionType, ButtonStyle } = require("discord.js");
const REPORT_CHANNEL_ID = '846766111424380998'; // החלף בזה את ה-ID של הערוץ הקבוע

module.exports = {
    name: "bugreport",
    description: "Submit a bug report",
    category: "UTILITY",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "<description>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "description",
                description: "The description of the bug",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "command_name",
                description: "The command name where the bug occurred.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        if (!args[0]) {
            return message.reply("Please provide a description for the bug.");
        }

        const bugDescription = args.join(" ");

        message.channel.send("Which command is this bug related to?").then(() => {
            const filter = response => {
                return response.author.id === message.author.id;
            };

            message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                .then(async collected => {
                    const commandName = collected.first().content;

                    // שלח את הבאג לערוץ הדיווח
                    await handleBugReport(message.client, REPORT_CHANNEL_ID, bugDescription, commandName, message.author, message.guild) // הוסף את message.guild
                        .then(() => {
                            // יצירת ה-Embed להודעת אישור
                            const embed1 = new EmbedBuilder()
                                .setTitle("Bug Report Has Been Sent!")
                                .setDescription(`Your report was successfully sent! \nDescription: ${bugDescription} \nStatus: :heavy_check_mark:`)
                                .setFooter({ text: 'If you abuse this feature you will be put on a blacklist and will be prevented from using bot commands.' })
                                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                                .setColor("#00A56A");

                            // שלח את ה-Embed למשתמש בהודעה פרטית
                            message.author.send({ embeds: [embed1] })
                                .then(() => {
                                    message.react('✅'); // הוסף תגובה של ✔️ להודעה
                                })
                                .catch(error => {
                                    console.error("Error sending DM to user:", error);
                                    message.reply("There was an error sending you a direct message with the report confirmation.");
                                });
                        })
                        .catch(error => {
                            console.error("Error while sending bug report:", error);
                            message.reply("There was an error trying to send your bug report.");
                        });
                })
                .catch(() => {
                    message.reply("You did not provide a command name in time!");
                });
        });
    },

    async interactionRun(interaction) {
        const description = interaction.options.getString("description");
        const commandName = interaction.options.getString("command_name");

        // קבלת ערוץ הדיווח
        const reportChannel = interaction.client.channels.cache.get(REPORT_CHANNEL_ID);
        if (!reportChannel) {
            console.error("Bug report channel not found."); // הדפסת שגיאה בקונסול
            return interaction.reply({
                content: "There was an error trying to send your bug report.",
                ephemeral: true,
            });
        }

        await handleBugReport(interaction.client, REPORT_CHANNEL_ID, description, commandName, interaction.user, interaction.guild); // הוסף את interaction.guild

        // יצירת ה-embed
        const embed1 = new EmbedBuilder()
            .setTitle("Bug Report Has Been Sent!")
            .setDescription(`Your report was successfully sent! \nDescription: ${description} \nStatus: :heavy_check_mark:`)
            .setFooter({ text: 'If you abuse this feature you will be put on a blacklist and will be prevented from using bot commands.' })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor("#00A56A"); // צבע ההודעה

        // שלח את ה-embed בפרטי למשתמש
        await interaction.user.send({ embeds: [embed1] })
            .then(async () => {
                // הוסף את הריאקציה להודעה של האינטרקציה
                await interaction.followUp({ content: "Your bug report has been submitted successfully!", ephemeral: true });
            })
            .catch(error => {
                console.error("Error sending DM to user:", error);
               // await interaction.followUp({ content: "Could not send you a direct message.", ephemeral: true });
            });

        // await interaction.followUp("Your bug report has been submitted!"); // הוספת תשובה לאחר הדיווח
    },
};

async function handleBugReport(client, reportChannelId, description, commandName, user, guild) {
    const embed = new EmbedBuilder()
        .setTitle("🚨 Bug Report")
        .addFields(
            { name: "Description", value: description },
            { name: "Command Name", value: commandName },
            { name: "Reported By", value: `${user.tag} (${user.id})` },
            { name: "Server", value: `${guild.name} (${guild.id})` }
        )
        .setColor("#FF0000") // צבע אדום
        .setTimestamp();

    const button = new ButtonBuilder()
        .setCustomId(`bug_fixed`) // הוסף את תיאור הבאג ל-Custom ID
        .setLabel('Mark as Fixed')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const reportChannel = client.channels.cache.get(reportChannelId);
    await reportChannel.send({ embeds: [embed], components: [row] });
}
