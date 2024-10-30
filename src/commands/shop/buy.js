const User = require("../../models/User"); // ���� ���� ���������� �����
const ShopItem = require("../../models/ShopItem"); // ���� ���� ����� �����

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

        if (id < 0 || id >= items.length) return message.channel.send("�� ����� �� ����� �� ����� ���.");

        const item = items[id];
        if (coins < item.coins) return message.channel.send("��� �� ����� ����� ��� ����� ���� ��.");

        const role = message.guild.roles.cache.get(item.roleId);
        if (!role) return message.channel.send("���� �� ���� ����.");

        if (message.member.roles.cache.has(role.id)) return message.channel.send("�� �� ��� �� ���� ���.");

        await message.member.roles.add(role);
        await User.updateOne({ guildId: message.guild.id, userId: userId }, { $inc: { coins: -item.coins } });

        message.channel.send(`**������ ����� ������ ���� �� ����: ${role.toString()}**`);
    }
};
