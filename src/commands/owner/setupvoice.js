const { ChannelType, PermissionsBitField } = require("discord.js");
const voiceSchema = require("../../models/voice"); // ייבוא המודל

module.exports = {
    name: "setup-voice",
    description: "Set up a custom voice system in your server",
    category: "OWNER",
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
    },
    async messageRun(message) {
        // בדיקה שהפקודה תפעל רק על ידך
        if (message.author.id !== "719512505159778415") {
            return/* message.reply("This command can only be used by the owner.")*/;
        }
        // בדיקה שהפקודה תפעל רק בשרת המסוים שלך
        if (message.guild.id !== "675018624452526110") {
            return message.reply("This command can only be used in the specific server.");
        }

        const response = await setupVoiceSystem(message.guild, message);
        return message.channel.send(response);
    },

    async interactionRun(interaction) {
        // בדיקה שהפקודה תפעל רק על ידך
        if (interaction.user.id !== "719512505159778415") {
            return/* interaction.reply({ content: "This command can only be used by the owner.", ephemeral: true })*/;
        }
        // בדיקה שהפקודה תפעל רק בשרת המסוים שלך
        if (interaction.guild.id !== "675018624452526110") {
            return /*interaction.reply({ content: "This command can only be used in the specific server.", ephemeral: true })*/;
        }

        const response = await setupVoiceSystem(interaction.guild, interaction);
        return interaction.followUp(response);
    },
};

async function setupVoiceSystem(guild, source) {
    try {
        // Create a category for custom voice channels
        const category = await guild.channels.create({
            name: "Custom Voice",
            type: ChannelType.GuildCategory,
        });

        // Create a default voice channel under the category
        const voiceChannel = await guild.channels.create({
            name: "➕ Create Voice",
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: [
                {
                    deny: [PermissionsBitField.Flags.Speak],
                    id: guild.id,
                },
            ],
        });

        // Save the information to the database
        let data = await voiceSchema.findOne({ Guild: guild.id });
        if (data) {
            data.Category = category.id;
            data.Channel = voiceChannel.id;
            data.ChannelName = "{emoji} {channel name}";
            await data.save();
        } else {
            const newVoiceData = new voiceSchema({
                Guild: guild.id,
                Category: category.id,
                Channel: voiceChannel.id,
                ChannelName: "{emoji} {channel name}",
                ChannelCount: 0, // Default count
            });
            await newVoiceData.save();
        }

        // Send a success response
        return {
            content: "Custom voice system has been set up successfully!",
            embeds: [
                {
                    title: "🎙️ Custom Voice Setup",
                    description: "A new custom voice system has been configured.",
                    fields: [
                        {
                            name: "📘 Channel",
                            value: `${voiceChannel} (${voiceChannel.name})`,
                        },
                    ],
                    color: 0x00ff00,
                },
            ],
        };
    } catch (error) {
        console.error("Failed to set up custom voice system:", error);
        return {
            content: "An error occurred while setting up the custom voice system. Please try again later.",
        };
    }
}
