const { ApplicationCommandOptionType } = require("discord.js");
const LevelRole = require("../../models/LevelRole");

module.exports = {
    name: "setlevelrole",
    description: "Sets a role for a specific level.",
    category: "OWNER",
    command: {
        enabled: true,
        usage: "<level> <roleId>",
        minArgsCount: 2,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "level",
                description: "Level to assign the role to",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
            {
                name: "role",
                description: "Role ID to assign",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    async messageRun(message, args) {
        if (message.author.id !== '719512505159778415') {
            return;
        }
        const level = parseInt(args[0]);
        const roleId = args[1];

        if (isNaN(level)) return message.safeReply("Please provide a valid level.");

        await LevelRole.findOneAndUpdate(
            { guildId: message.guild.id, level },
            { roleId },
            { upsert: true }
        );

        return message.safeReply(`Role ${roleId} has been set for level ${level}.`);
    },
    async interactionRun(interaction) {
        if (interaction.user.id !== '719512505159778415') {
            return;
        }
        const level = interaction.options.getInteger("level");
        const roleId = interaction.options.getString("role");

        await LevelRole.findOneAndUpdate(
            { guildId: interaction.guild.id, level },
            { roleId },
            { upsert: true }
        );

        return interaction.followUp(`Role ${roleId} has been set for level ${level}.`);
    },
};
