const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "dm",
    description: "Send a direct message to a user via the bot.",
    category: "OWNER",
    botPermissions: ["SendMessages"],
    command: {
        enabled: true,
        usage: "<user_id> <message>",
        minArgsCount: 2,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "user_id",
                description: "The ID of the user you want to message",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "message",
                description: "The message you want to send",
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ],
    },

    async messageRun(message, args) {
        const botOwnerId = "719512505159778415";
        if (message.author.id !== botOwnerId) return;

        const userId = args[0];
        const dmMessage = args.slice(1).join(" ");

        try {
            const user = await message.client.users.fetch(userId);
            await user.send(dmMessage);
            /*  await message.safeReply(`Message sent to <@${userId}>`);*/
            const embed = new EmbedBuilder()
                .setColor("#2ecc70")
                .setDescription(`📩 **Message sent to** ${user.tag} (${user.id})`)
                .setFooter({ text: "DM Command", iconURL: message.client.user.displayAvatarURL() })
                .setTimestamp();

            await message.safeReply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await message.safeReply("Failed to send the message. Make sure the user ID is correct and that the bot can DM this user.");
        }
    },

    async interactionRun(interaction) {
        const botOwnerId = "719512505159778415";
        if (interaction.user.id !== botOwnerId) {
            return/* interaction.followUp("You are not authorized to use this command.")*/;
        }
        const userId = interaction.options.getString("user_id");
        const dmMessage = interaction.options.getString("message");

        try {
            const user = await interaction.client.users.fetch(userId);
            await user.send(dmMessage);
            //    await interaction.followUp(`Message sent to <@${userId}>`);
            const embed = new EmbedBuilder()
                .setColor("#2ecc70")
                .setDescription(`📩 **Message sent to** ${user.tag} (${user.id})`)
                .setFooter({ text: "DM Command", iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.followUp({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            await interaction.followUp("Failed to send the message. Make sure the user ID is correct and that the bot can DM this user.");
        }
    },
};
