const CustomCommand = require("../../models/customcommandmodel"); // המודל שיצרנו
const { isPremium } = require("../../helpers/premiumHelper");

module.exports = {
    name: "removecustomcommand",
    description: "Remove a custom command for premium users.",
    category: "PREMIUM",
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "command_name",
                description: "The name of the custom command to remove.",
                type: 3, // ApplicationCommandOptionType.String
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        const guildId = message.guild.id;

        // בדוק אם השרת הוא פרימיום
        const premiumStatus = await isPremium(guildId);
        if (!premiumStatus) {
            return /*message.safeReply("This command can only be used in premium servers.")*/;
        }

        if (args.length < 1) {
            return message.safeReply("Usage: `!removeCustomCommand <command_name>`");
        }

        const commandName = args[0].toLowerCase();

        // הסר את הפקודה המותאמת
        await CustomCommand.deleteOne({ guildId, commandName });
        return message.safeReply(`Custom command \`${commandName}\` has been removed.`);
    },

    async interactionRun(interaction) {
        const guildId = interaction.guild.id;

        // בדוק אם השרת הוא פרימיום
        const premiumStatus = await isPremium(guildId);
        if (!premiumStatus) {
            return /*interaction.reply({ content: "This command can only be used in premium servers.", ephemeral: true })*/;
        }

        const commandName = interaction.options.getString("command_name").toLowerCase();

        // הסר את הפקודה המותאמת
        const result = await CustomCommand.deleteOne({ guildId, commandName });

        if (result.deletedCount === 0) {
            return interaction.followUp({ content: `Custom command \`${commandName}\` does not exist.`, ephemeral: true });
        }

        return interaction.followUp({ content: `Custom command \`${commandName}\` has been removed.` });
    },
};
