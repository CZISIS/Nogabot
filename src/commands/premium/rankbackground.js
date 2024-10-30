const { ApplicationCommandOptionType } = require("discord.js");
const Premium = require("../../models/premiumModel"); // Importing the premium model
const Background = require("../../models/Background"); // Importing the background model

module.exports = {
    name: "rankbackground",
    description: "Change the rank card background to an image or color, or remove it.",
    cooldown: 5,
    category: "PREMIUM",
    botPermissions: ["AttachFiles"],
    command: {
        enabled: true,
        usage: "<color/image/remove>",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "background",
                description: "Specify a color in HEX, an image URL, or 'remove' to clear the background",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        const background = args[0] // Convert to lowercase for uniformity
        const guildId = message.guild.id;

        // Check if user has premium
        const userData = await getPremium(guildId); // Fetch premium data
        if (!userData || !userData.isPremium) {
            return message.reply("This command is available only for premium members.");
        }

        // Check if user wants to remove the background
        if (background === "remove") {
            await removeRankBackground(guildId); // Function to clear the background
            return message.reply("Successfully removed your rank card background.");
        }

        // Validate the background
        if (!isValidBackground(background)) {
            return message.reply("Please provide a valid HEX color code or a valid image URL. (or remove)");
        }

        // Update background in the database
        await updateRankBackground(guildId, background); // Corrected the function call
        return message.reply(`Successfully changed your rank card background to ${background}`);
    },

    async interactionRun(interaction) {
        const background = interaction.options.getString("background").toLowerCase(); // Convert to lowercase
        const guildId = interaction.guild.id;

        // Check if user has premium
        const userData = await getPremium(guildId); // Fetch premium data
        if (!userData || !userData.isPremium) {
            return interaction.reply("This command is available only for premium members.");
        }

        // Check if user wants to remove the background
        if (background === "remove") {
            await removeRankBackground(guildId); // Function to clear the background
            return interaction.reply("Successfully removed your rank card background.");
        }

        // Validate the background
        if (!isValidBackground(background)) {
            return interaction.reply("Please provide a valid HEX color code or a valid image URL.");
        }

        // Update background in the database
        await updateRankBackground(guildId, background); // Corrected the function call
        return interaction.reply(`Successfully changed your rank card background to ${background}`);
    },
};

// Function to validate if the background is a valid HEX or URL
function isValidBackground(background) {
    const hexColorPattern = /^#[0-9A-F]{6}$/i; // HEX color pattern
    const urlPattern = /^(http|https):\/\/.*(jpeg|jpg|png|gif)$/; // Image URL pattern
    return hexColorPattern.test(background) || urlPattern.test(background);
}

// Function to update the rank card background in the database
async function updateRankBackground(guildId, background) {
    try {
        const result = await Background.updateOne(
            { guildId },
            { rankBackground: background },
            { upsert: true } // Create a new document if it doesn't exist
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully updated rank background for guild ${guildId} to ${background}`);
        } else if (result.upsertedCount > 0) {
            console.log(`Successfully created new background entry for guild ${guildId} with rank background: ${background}`);
        } else {
            console.log(`No changes made to the rank background for guild ${guildId}`);
        }
    } catch (error) {
        console.error(`Failed to update rank background for guild ${guildId}:`, error);
        throw new Error("There was an error updating the rank background.");
    }
}

// Function to remove the rank card background in the database
async function removeRankBackground(guildId) {
    try {
        const result = await Background.updateOne(
            { guildId },
            { $unset: { rankBackground: "" } } // Removes the rankBackground field
        );

        if (result.modifiedCount > 0) {
            console.log(`Successfully removed rank background for guild ${guildId}`);
        } else {
            console.log(`No rank background to remove for guild ${guildId}`);
        }
    } catch (error) {
        console.error(`Failed to remove rank background for guild ${guildId}:`, error);
        throw new Error("There was an error removing the rank background.");
    }
}

// Function to fetch premium data for the guild
async function getPremium(guildId) {
    try {
        const premiumData = await Premium.findOne({ guildId });
        console.log("Fetched premium data:", premiumData);
        return premiumData; // Return premium data
    } catch (error) {
        console.error(`Failed to fetch premium data for guild ${guildId}:`, error);
        throw new Error("There was an error fetching premium data.");
    }
}
