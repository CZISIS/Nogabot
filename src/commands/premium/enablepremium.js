const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const Premium = require("../../models/premiumModel"); // Import the model
const { EMBED_COLORS } = require("@root/config.js");

module.exports = {
    name: "enablepremium",
    description: "Enable premium for a guild.",
    cooldown: 5,
    category: "OWNER",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        minArgsCount: 1,
        usage: "<guildId>",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "guildid",
                description: "The ID of the guild to enable premium for.",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    },

    async messageRun(message, args) {
        const ownerId = "719512505159778415"; // Owner's ID

        // Check if the user is the owner
        if (message.author.id !== ownerId) {
            console.log("User is not the owner:", message.author.id);
            return;
        }

        const guildId = args[0];
        console.log("Received request to enable premium for guild:", guildId);

        // Validate the guild ID
        if (!guildId) {
            console.log("No valid guild ID provided.");
            return message.reply({ content: "Please provide a valid guild ID." });
        }

        // Check if premium already exists
        let premiumData = await Premium.findOne({ guildId });
        console.log("Fetched premium data:", premiumData);

        if (premiumData && premiumData.isPremium) { // Check for premium
            console.log("This server already has premium.");
            return message.reply({ content: "This server already has premium." });
        }

        // Add premium to the server
        if (!premiumData) {
            premiumData = new Premium({ guildId, isPremium: true });
            console.log("Creating new premium record for guild:", guildId);
        } else {
            premiumData.isPremium = true;
            console.log("Updating premium status for guild:", guildId);
        }

        await premiumData.save();
        console.log(`Added new premium guild: ${guildId}`);

        // Send log message to your support server's log channel
        const logChannelId = "846766092432179252"; // Your support server's log channel ID
        const logChannel = message.client.channels.cache.get(logChannelId);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.SUCCESS)
                .setTitle("🚀 Premium Enabled")
                .setDescription(`**Premium has been enabled for the server!**`)
                .addFields(
                    { name: "Server ID", value: guildId, inline: true },
                    { name: "Server Name", value: message.guild.name, inline: true },
                    { name: "Owner ID", value: message.guild.ownerId, inline: true },
                    { name: "Owner Name", value: message.guild.members.cache.get(message.guild.ownerId).user.tag, inline: true }
                )
                .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        } else {
            console.log("Log channel not found.");
        }

        // Send a message to the system channel of the server
        const targetGuild = await message.client.guilds.fetch(guildId).catch(err => {
            console.log("Could not fetch the guild:", err);
            return null;
        });

        // Send a message to the system channel of the specified server
        if (targetGuild) {
            const systemChannel = targetGuild.systemChannel;
            if (systemChannel) {
                await systemChannel.send(`🎉 **Welcome to Premium!** You can now enjoy our exclusive features!`);
            } else {
                console.log("System channel not found for the specified guild.");
            }
        } else {
            console.log("Target guild not found.");
        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.SUCCESS)
            .setDescription(`Premium has been enabled for the guild with ID: \`${guildId}\``)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    },

    async interactionRun(interaction) {
        const guildId = interaction.options.getString("guildid");
        const ownerId = "719512505159778415"; // Owner's ID

        // Check if the user is the owner
        if (interaction.user.id !== ownerId) {
            return interaction.followUp({ content: "You do not have permission to use this command." });
        }

        // Validate the guild ID
        if (!guildId) {
            return interaction.followUp({ content: "Please provide a valid guild ID." });
        }

        // Check if premium already exists
        let premiumData = await Premium.findOne({ guildId });
        console.log("Fetched premium data:", premiumData);

        if (premiumData && premiumData.isPremium) { // Check for premium
            return interaction.followUp({ content: "This server already has premium." });
        }

        // Add premium to the server
        if (!premiumData) {
            premiumData = new Premium({ guildId, isPremium: true });
            console.log("Creating new premium record for guild:", guildId);
        } else {
            premiumData.isPremium = true;
            console.log("Updating premium status for guild:", guildId);
        }

        await premiumData.save();
        console.log(`Added new premium guild: ${guildId}`);

        // Send log message to your support server's log channel
        const logChannelId = "846766092432179252"; // Your support server's log channel ID
        const logChannel = interaction.client.channels.cache.get(logChannelId);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.SUCCESS)
                .setTitle("🚀 Premium Enabled")
                .setDescription(`**Premium has been enabled for the server!**`)
                .addFields(
                    { name: "Server ID", value: guildId, inline: true },
                    { name: "Server Name", value: interaction.guild.name, inline: true },
                    { name: "Owner ID", value: interaction.guild.ownerId, inline: true },
                    { name: "Owner Name", value: interaction.guild.members.cache.get(interaction.guild.ownerId).user.tag, inline: true }
                )
                .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        } else {
            console.log("Log channel not found.");
        }

        // Send a message to the system channel of the server
        const targetGuild = await interaction.client.guilds.fetch(guildId).catch(err => {
            console.log("Could not fetch the guild:", err);
            return null;
        });

        // Send a message to the system channel of the specified server
        if (targetGuild) {
            const systemChannel = targetGuild.systemChannel;
            if (systemChannel) {
                await systemChannel.send(`🎉 **Welcome to Premium!** You can now enjoy our exclusive features!`);
            } else {
                console.log("System channel not found for the specified guild.");
            }
        } else {
            console.log("Target guild not found.");
        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.SUCCESS)
            .setDescription(`Premium has been enabled for the guild with ID: \`${guildId}\``)
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    },
};
