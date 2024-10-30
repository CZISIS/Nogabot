const User = require("../../models/User"); // מודל עבור סטטיסטיקות חברים
const ShopItem = require("../../models/ShopItem"); // מודל עבור פריטי החנות

module.exports = {
    name: "buy",
    description: "Buy a role from the shop.",
    category: "SHOP",
    cooldown: 5,

    async run(bot, message, args) {
        if (message.guild.id !== '675018624452526110') return;

        const userId = message.author.id;
        const coinsData = await User.findOne({ guildId: message.guild.id, userId: userId });
        const coins = coinsData ? coinsData.coins : 0;

        // Fetch all shop items
        const items = await ShopItem.find({ guildId: message.guild.id });
        const id = Number(args[0]) - 1; // assuming args[0] is the item index

        if (id < 0 || id >= items.length) return message.channel.send("לא מצאתי את הפריט עם המספר הזה.");

        const item = items[id];
        if (coins < item.coins) return message.channel.send("אין לך מספיק קוינס כדי לקנות פריט זה.");

        const role = message.guild.roles.cache.get(item.roleId);
        if (!role) return message.channel.send("הרול לא קיים יותר.");

        if (message.member.roles.cache.has(role.id)) return message.channel.send("יש לך כבר את הרול הזה.");

        await message.member.roles.add(role);
        await User.updateOne({ guildId: message.guild.id, userId: userId }, { $inc: { coins: -item.coins } });

        message.channel.send(`**הקנייה בוצעה בהצלחה קנית את הרול: ${role.toString()}**`);
    }
};
