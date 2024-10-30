const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const ShopItem = require("../../models/ShopItem"); // Importing the shop item model
const User = require("../../models/User"); // Importing the User model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "shop",
    description: "Displays the shop items available for purchase.",
    category: "SHOP",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "",
    },
   /* slashCommand: {
        enabled: false,
        options: [],
    },*/

    async messageRun(message, args, data) {
        const response = await getShop(message);
        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const response = await getShop(interaction);
        await interaction.reply(response);
    },
};

async function getShop({ guild, member, channel }, page = 1) {
    // Check if the server is valid
    if (guild.id !== '675018624452526110') {
        return;
    }

    // Fetch the user's coins from the User model
    const userData = await User.findOne({ guildId: guild.id, userId: member.user.id });
    if (!userData || userData.coins === undefined) {
        return "Unable to retrieve your coin balance.";
    }

    const userCoins = userData.coins;

    // Fetch the shop items from the database
    const shopItems = await ShopItem.find({ guildId: guild.id });
    if (!shopItems || shopItems.length === 0) {
        return "No items are available in the shop.";
    }

    const ITEMS_PER_PAGE = 10; // Number of items per page
    const totalPages = Math.ceil(shopItems.length / ITEMS_PER_PAGE);
    page = Math.min(Math.max(1, page), totalPages);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const itemsToDisplay = shopItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Create the embed message
    const embed = {
        title: `CZISIS Shop`,
        description: itemsToDisplay
            .sort((a, b) => a.price - b.price)
            .map((item, i) => {
                const role = guild.roles.cache.find(r => r.name === item.emoji || r.name === item.name);

                // בדוק אם התפקיד קיים
                if (!role) {
                    return `**\`${startIndex + i + 1}\` - Role not found - ${item.price} coins**`;
                }

                // הצג את השם של התפקיד
                return `**\`${startIndex + i + 1}\` - <@&${role.id}> - ${item.price} coins**`;
            })
            .join("\n"),
        footer: { text: `You have ${userCoins.toLocaleString()} coins.` },
    };


    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === totalPages)
        );

    // Send the initial reply with the embed and buttons
    const reply = await channel.send({ embeds: [embed], components: [row] });

    // Set up a collector to handle button interactions
    const filter = (buttonInteraction) => buttonInteraction.user.id === member.user.id;

    const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
        await buttonInteraction.deferUpdate();

        if (buttonInteraction.customId === 'next' && page < totalPages) {
            await getShop({ guild, member, channel }, page + 1); // Pass the correct parameters
        } else if (buttonInteraction.customId === 'previous' && page > 1) {
            await getShop({ guild, member, channel }, page - 1); // Pass the correct parameters
        }
    });

    collector.on('end', () => {
        row.components.forEach(button => button.setDisabled(true));
        reply.edit({ embeds: [embed], components: [row] }); // Update the message to disable buttons
    });
}
