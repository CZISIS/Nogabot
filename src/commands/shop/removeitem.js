const { ApplicationCommandOptionType } = require("discord.js");
const ShopItem = require("../../models/ShopItem"); // Importing the ShopItem model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "removeitem",
    description: "Removes an item from the shop by ID, name, or table number.",
    category: "SHOP",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "<item_id_or_name>",
    },
   /* slashCommand: {
        enabled: false,
        options: [
            {
                name: "item_identifier",
                description: "The ID, name, or table number of the item to remove.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },*/

    async messageRun(message, args) {
        const itemIdentifier = args[0];

        const response = await removeItem(message, itemIdentifier);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const itemIdentifier = interaction.options.getString("item_identifier");

        const response = await removeItem(interaction, itemIdentifier);
        await interaction.followUp(response);
    },
};

async function removeItem({ guild }, itemIdentifier) {
    // Check if the server is valid
    if (guild.id !== '675018624452526110') {
        return "This command can only be used in the designated server.";
    }

    // Fetch all items from the shop
    const items = await ShopItem.find(); // Adjust based on your DB schema

    // Try to find the item by ID, name, or table number
    let itemToRemove = null;

    // Check if it's a number (table number)
    if (!isNaN(itemIdentifier)) {
        const index = parseInt(itemIdentifier) - 1; // Convert to zero-based index
        itemToRemove = items[index] || null; // Check if the index is valid
    }

    // Check if it's a name
    if (!itemToRemove) {
        itemToRemove = items.find(item => item.name === itemIdentifier);
    }

    // Check if it's an ID
    if (!itemToRemove) {
        itemToRemove = items.find(item => item.emoji === itemIdentifier);
    }

    if (!itemToRemove) {
        return "Could not find an item with that ID, name, or table number.";
    }

    // Remove the item from the database
    await ShopItem.deleteOne({ _id: itemToRemove._id });

    return `Successfully removed item ${itemToRemove.name} from the shop!`;
}
