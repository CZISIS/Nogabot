const { ApplicationCommandOptionType } = require("discord.js");
const ShopItem = require("../../models/ShopItem");

module.exports = {
    name: "additem",
    description: "Adds an item to the shop.",
    category: "SHOP",
    cooldown: 5,
    command: {
        enabled: true,
        usage: "<role_name_or_id> <price>",
    },
  /*  slashCommand: {
        enabled: false,
        options: [
            {
                name: "role",
                description: "The name or ID of the role.",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "price",
                description: "The price of the item in coins.",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },*/

    async messageRun(message, args) {
        const roleInput = args[0];
        const price = args[1];

        const response = await addItem(message, roleInput, price);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const roleInput = interaction.options.getString("role");
        const price = interaction.options.getInteger("price");

        const response = await addItem(interaction, roleInput, price);
        await interaction.followUp(response);
    },
};

async function addItem({ guild }, roleInput, price) {
    // Check if the server is valid
    if (guild.id !== '675018624452526110') {
        return "This command can only be used in the designated server.";
    }

    // Convert price to a number and validate it
    price = parseInt(price);
    if (isNaN(price) || price <= 0) {
        return "Please provide a valid price for the item.";
    }

    // Find the role by name or ID
    const role = guild.roles.cache.find(r => r.name === roleInput || r.id === roleInput);
    if (!role) {
        return "Could not find a role with that ID or name.";
    }

    // Create new shop item
    const newItem = new ShopItem({
        name: role.name,  // שומר את שם הרול
        price: price,     // שומר את המחיר
        emoji: role.toString() // שומר את האימוגי של הרול
    });

    await newItem.save(); // שמור את הפריט בחנות

    return `Successfully added item ${role.toString()} with price ${price} coins to the shop!`;
}
