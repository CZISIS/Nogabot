const { ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const User = require("../../models/User"); // Importing the User model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "removecoins",
    description: "Removes coins from a user's balance.",
    category: "SHOP",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "<@user> <amount>",
    },
   /* slashCommand: {
        enabled: false,
        options: [
            {
                name: "user",
                description: "The user to remove coins from.",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: "amount",
                description: "The amount of coins to remove.",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },*/

    async messageRun(message, args, data) {
        const member = (await message.guild.resolveMember(args[0])) || message.member;
        const response = await removeCoins(message, member.id, args[1]);
        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user);
        const response = await removeCoins(interaction, member.id, interaction.options.getInteger("amount"));
        await interaction.followUp(response);
    },
};

async function removeCoins({ guild }, userId, amount) {
    // Check if the server is valid
    if (guild.id !== '675018624452526110') {
        return;
    }

    // Convert amount to a number and validate it
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        return "Please provide a valid amount of coins to remove.";
    }

    // Fetch the user data
    const targetUserData = await User.findOne({ guildId: guild.id, userId });

    if (!targetUserData) {
        return "User not found in the database.";
    }

    // Check if the user has enough coins
    if (targetUserData.coins < amount) {
        return `${targetUserData.userId} does not have enough coins to remove.`;
    }

    // Update the user's coin balance
    targetUserData.coins -= amount;
    await targetUserData.save();

    // Create the embed message
    const embedColor = parseInt(EMBED_COLORS.SUCCESS.replace('#', '0x')); // Convert HEX to number
    const embed = {
        color: embedColor,
        title: "Coins Removed",
        description: `Successfully removed \`${amount.toLocaleString()}\` coins from <@${userId}>.`,
    };

    // Return the embed in a format suitable for safeReply
    return {
        embeds: [embed], // Must be an array
    };
}
