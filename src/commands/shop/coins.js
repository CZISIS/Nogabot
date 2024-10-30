// const { ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const User = require("../../models/User"); // Importing the User model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "coins",
    description: "Displays the coin balance of a user.",
    category: "SHOP",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "<@user>",
    },
  /*  slashCommand: {
        enabled: false,
        options: [
            {
                name: "user",
                description: "The user to check the coins for.",
                type: 6, // ApplicationCommandOptionType.User
                required: false,
            },
        ],
    },*/

    async messageRun(message, args, data) {
        const response = await getCoins(message);
        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const response = await getCoins(interaction);
        await interaction.followUp(response);
    },
};

async function getCoins({ guild, member }) {
    // Check if the server is valid
    if (guild.id !== '675018624452526110') {
        return;
    }

    // Fetch the user's data from the User model
    const userId = member.user.id;
    const userData = await User.findOne({ guildId: guild.id, userId });

    if (!userData || userData.coins === undefined) {
        return "Unable to retrieve your coin balance.";
    }

    const userCoins = userData.coins;

    // Create the embed message
    const embed = {
        color: EMBED_COLORS.DEFAULT,
        //title: `${member.user.username}'s Coin Balance`,
        description: `${member}, Has \`${userCoins.toLocaleString()}\` coins.`,
    };

    return { embeds: [embed] };
}
