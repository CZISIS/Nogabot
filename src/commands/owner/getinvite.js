const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "getinvite",
    description: "Get an invite link to a server where the bot is present.",
    category: "OWNER",
    botPermissions: ["CreateInstantInvite"],
    command: {
        enabled: true,
        usage: "<server_name_or_id>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: false,
        options: [
            {
                name: "server",
                description: "The name or ID of the server",
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ],
    },

    async messageRun(message, args) {
        const botOwnerId = "719512505159778415";
        if (message.author.id !== botOwnerId) return;

        const guildId = args[0];
        const guild = message.client.guilds.cache.get(guildId);

        if (!guild) {
            return message.reply("The bot is not in this server.");
        }

        const channel = guild.channels.cache.find(ch =>
            ch.isTextBased() &&
            ch.permissionsFor(guild.members.me).has("CreateInstantInvite")
        );

        if (!channel) {
            return message.reply("Could not find a suitable channel to create an invite.");
        }

        try {
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            message.reply(`Invite link: ${invite.url}`);
        } catch (err) {
            console.error(err);
            message.reply("Failed to create an invite.");
        }
    },

    async interactionRun(interaction) {
        const botOwnerId = "719512505159778415";
        if (interaction.user.id !== botOwnerId) return interaction.followUp("You are not authorized to use this command.");

        const guildId = interaction.options.getString("guild_id");
        let guild = interaction.client.guilds.cache.get(guildId);

        if (!guild) {
            try {
                guild = await interaction.client.guilds.fetch(guildId);
            } catch (err) {
                return interaction.followUp("The bot is not in this server, or failed to fetch the server.");
            }
        }

        const channel = guild.channels.cache.find(ch =>
            ch.isTextBased() &&
            ch.permissionsFor(guild.members.me).has("CreateInstantInvite")
        );

        if (!channel) {
            return interaction.followUp("Could not find a suitable channel to create an invite.");
        }

        try {
            const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
            interaction.followUp(`Invite link: ${invite.url}`);
        } catch (err) {
            console.error(err);
            interaction.followUp("Failed to create an invite.");
        }
    },
};

