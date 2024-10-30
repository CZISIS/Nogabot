const { ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const User = require("../../models/User"); // Importing the User model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "addcoins",
    description: "Adds coins to a user's balance.",
    category: "SHOP",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "<@user> <amount>",
    },
  /*  slashCommand: {
        enabled: false,
        options: [
            {
                name: "user",
                description: "The user to add coins to.",
                type: ApplicationCommandOptionType.User, // ApplicationCommandOptionType.User
                required: true,
            },
            {
                name: "amount",
                description: "The amount of coins to add.",
                type: ApplicationCommandOptionType.Integer, // ApplicationCommandOptionType.Integer
                required: true,
            },
        ],
    },*/

    async messageRun(message, args, data) {
        if (message.guild.id !== '675018624452526110') {
            return;
        }
        const userId = message.mentions.users.first()?.id; // קבל את ה-ID של המשתמש המוזכר
        const amount = args[1]; // קח את הכמות מהארגומנטים
        const response = await addCoins(message, userId, amount);

        // אם התגובה היא טקסט רגיל
        if (typeof response === "string") {
            await message.safeReply(response);
        } else {
            await message.safeReply(response); // התגובה צריכה להיות בפורמט נכון
        }
    },

    async interactionRun(interaction, data) {
        if (interaction.guild.id !== '675018624452526110') {
            return;
        }
        const userId = interaction.options.getUser("user").id; // קבל את ה-ID של המשתמש מהאינטראקציה
        const amount = interaction.options.getInteger("amount"); // קח את הכמות מהאינטראקציה
        const response = await addCoins(interaction, userId, amount);

        // אם התגובה היא טקסט רגיל
        if (typeof response === "string") {
            await interaction.followUp(response);
        } else {
            await interaction.followUp(response); // התגובה צריכה להיות בפורמט נכון
        }
    },
};

async function addCoins({ guild }, userId, amount) {
    // Check if the server is valid
    if (guild.id !== '675018624452526110') {
        return;
    }

    // Convert amount to a number and validate it
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        return "Please provide a valid amount of coins to add.";
    }

    // Fetch the user data
    const targetUserData = await User.findOne({ guildId: guild.id, userId });

    if (!targetUserData) {
        return "User not found in the database.";
    }

    // Update the user's coin balance
    targetUserData.coins += amount;
    await targetUserData.save();

    // Create the embed message
    const embedColor = parseInt(EMBED_COLORS.SUCCESS.replace('#', '0x')); // Convert HEX to number
    const embed = {
        color: embedColor,
        title: "Coins Added",
        description: `Successfully added \`${amount.toLocaleString()}\` coins to <@${userId}>.`,
    };

    // Return the embed in a format suitable for safeReply
    return {
        embeds: [embed], // Must be an array
    };
}


