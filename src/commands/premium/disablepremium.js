const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const Premium = require("../../models/premiumModel"); // Import the model
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "disablepremium",
    description: "Disable premium for a guild.",
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
                description: "The ID of the guild to disable premium for.",
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    },

    async messageRun(message, args) {
        const ownerId = "719512505159778415"; // Owner's ID

        // Check if the user is the owner
        if (message.author.id !== ownerId) {
            return;
        }

        // Get the Guild ID from the argument
        const guildId = args[0];

        // Validate the Guild ID
        if (!guildId) {
            return message.reply({ content: "Please provide a valid guild ID." });
        }

        // Check if premium exists for the guild
        let premiumData = await Premium.findOne({ guildId });
        console.log("Fetched premium data:", premiumData);
        if (!premiumData || !premiumData.isPremium) {
            return message.reply({ content: "This server does not have premium enabled." });
        }

        // Disable premium for the guild
        premiumData.isPremium = false;
        console.log("Disabling premium for guild:", guildId);
        await premiumData.save();

        // Send log message to your support server's log channel
        const logChannelId = "846766092432179252"; // Your support server's log channel ID
        const logChannel = message.client.channels.cache.get(logChannelId);
        if (logChannel) {
            // await logChannel.send(`🚫 **Premium has been disabled for server ${guildId}!**`);
            const logEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setTitle("🚫 Premium Disabled")
                .setDescription(`**Premium has been disabled for the server!**`)
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
             //   await systemChannel.send(`🔒 **Premium has been disabled.** We're sorry to see you go!`);
            } else {
                console.log("System channel not found for the specified guild.");
            }
        } else {
            console.log("Target guild not found.");
        }

        // Create the embed for the response message
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR) // Set color to red or any other suitable color
            .setDescription(`Premium has been disabled for the guild with ID: \`${guildId}\``)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() }) // Note that the footer is an object
            .setTimestamp();

        return message.channel.send({ embeds: [embed] }); // Returns an object
    },

    async interactionRun(interaction) {
        const guildId = interaction.options.getString("guildid");
        const ownerId = "719512505159778415"; // Owner's ID

        // Check if the user is the owner
        if (interaction.user.id !== ownerId) {
            return;/*interaction.followUp({ content: "You do not have permission to use this command." });*/
        }

        // Validate the Guild ID
        if (!guildId) {
            return interaction.followUp({ content: "Please provide a valid guild ID." });
        }

        // Check if premium exists for the guild
        let premiumData = await Premium.findOne({ guildId });
        if (!premiumData || !premiumData.isPremium) {
            return interaction.followUp({ content: "This server does not have premium enabled." });
        }

        // Disable premium for the guild
        premiumData.isPremium = false;
        await premiumData.save();

        // Send log message to your support server's log channel
        const logChannelId = "846766092432179252"; // Your support server's log channel ID
        const logChannel = interaction.client.channels.cache.get(logChannelId);
        if (logChannel) {
            //  await logChannel.send(`🚫 **Premium has been disabled for server ${guildId}!**`);
            const logEmbed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setTitle("🚫 Premium Disabled")
                .setDescription(`**Premium has been disabled for the server!**`)
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
              //  await systemChannel.send(`🔒 **Premium has been disabled.** We're sorry to see you go!`);
            } else {
                console.log("System channel not found for the specified guild.");
            }
        } else {
            console.log("Target guild not found.");
        }

        // Create the embed for the response message
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR) // Set color to red or any other suitable color
            .setDescription(`Premium has been disabled for the guild with ID: \`${guildId}\``)
            .setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }) // Note that the footer is an object
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] }); // Returns an object
    },
};
