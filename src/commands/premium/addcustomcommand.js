const { EmbedBuilder } = require("discord.js");
const CustomCommand = require("../../models/customcommandmodel"); // המודל שיצרנו
const { isPremium } = require("../../helpers/premiumHelper");

module.exports = {
    name: "addcustomcommand",
    description: "Add a custom command for premium users.",
    category: "PREMIUM",
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "command_name",
                description: "The name of the custom command.",
                type: 3, // ApplicationCommandOptionType.String
                required: true,
            },
            {
                name: "response",
                description: "The response for the custom command.",
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
            return/* message.safeReply("This command can only be used in premium servers.")*/;
        }

        // ודא שיש מספיק פרמטרים
        if (args.length < 2) {
            return message.safeReply("Usage: `!addCustomCommand <command_name> <response>`");
        }

        const commandName = args[0];
        const response = args.slice(1).join(" ");

        // בדוק אם הפקודה כבר קיימת
        const existingCommand = await CustomCommand.findOne({ guildId, commandName });
        if (existingCommand) {
            return message.safeReply(`The command \`${commandName}\` already exists. Please choose a different name.`);
        }

        // צור פקודה מותאמת חדשה
        const newCommand = new CustomCommand({ guildId, commandName, response });
        await newCommand.save();

        const embed = new EmbedBuilder()
            .setDescription(`Custom command \`${commandName}\` has been added with response: ${response}`);

        return message.safeReply({ embeds: [embed] });
    },

    async interactionRun(interaction) {
        const guildId = interaction.guild.id;

        // בדוק אם השרת הוא פרימיום
        const premiumStatus = await isPremium(guildId);
        if (!premiumStatus) {
            return/* interaction.reply({ content: "This command can only be used in premium servers.", ephemeral: true })*/;
        }

        const commandName = interaction.options.getString("command_name");
        const response = interaction.options.getString("response");

        // בדוק אם הפקודה כבר קיימת
        const existingCommand = await CustomCommand.findOne({ guildId, commandName });
        if (existingCommand) {
            return interaction.followUp({ content: `The command \`${commandName}\` already exists. Please choose a different name.`, ephemeral: true });
        }

        // צור פקודה מותאמת חדשה
        const newCommand = new CustomCommand({ guildId, commandName, response });
        await newCommand.save();

        const embed = new EmbedBuilder()
            .setDescription(`Custom command \`${commandName}\` has been added with response: ${response}`);

        return interaction.followUp({ embeds: [embed] });
    },
};
