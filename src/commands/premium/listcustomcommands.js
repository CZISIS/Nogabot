const CustomCommand = require("../../models/customcommandmodel");
const { isPremium } = require("../../helpers/premiumHelper");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "listcustomcommands",
    description: "List all custom commands for premium users.",
    category: "PREMIUM",
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
    },

    async messageRun(message) {
        const guildId = message.guild.id;

        // בדוק אם השרת הוא פרימיום
        const premiumStatus = await isPremium(guildId);
        if (!premiumStatus) {
            return /*message.safeReply("This command can only be used in premium servers.")*/;
        }

        // קבל את כל הפקודות המותאמות
        const commands = await CustomCommand.find({ guildId });

        const embed = new EmbedBuilder()
            .setTitle("Custom Commands")
            .setColor("#5865F2") // צבע
            .setDescription(commands.length ? commands.map(cmd => `\`${cmd.commandName}\``).join(", ") : "No custom commands found.");

        return message.safeReply({ embeds: [embed] });
    },

    async interactionRun(interaction) {
        const guildId = interaction.guild.id;

        // בדוק אם השרת הוא פרימיום
        const premiumStatus = await isPremium(guildId);
        if (!premiumStatus) {
            return/* interaction.reply({ content: "This command can only be used in premium servers.", ephemeral: true })*/;
        }

        // קבל את כל הפקודות המותאמות
        const commands = await CustomCommand.find({ guildId });

        const embed = new EmbedBuilder()
            .setTitle("Custom Commands")
            .setColor("#5865F2") // צבע
            .setDescription(commands.length ? commands.map(cmd => `\`${cmd.commandName}\``).join(", ") : "No custom commands found.");

        return interaction.followUp({ embeds: [embed] });
    },
};
