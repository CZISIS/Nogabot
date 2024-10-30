const { EMBED_COLORS } = require("@root/config");
const User = require("../../models/User"); // Importing the User model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "dailycoins",
    description: "Get daily coins reward.",
    category: "SHOP",
    cooldown: 86400, // 24 hours in seconds
    command: {
        enabled: true,
    },
  /*  slashCommand: {
        enabled: false,
    },*/

    async messageRun(message, args, data) {
        const userId = message.author.id; // Get the ID of the user who executed the command
        const response = await giveDailyCoins(message, userId);

        // Send the response
        if (typeof response === "string") {
            await message.safeReply(response);
        } else {
            await message.safeReply(response);
        }
    },

    async interactionRun(interaction, data) {
        const userId = interaction.user.id; // Get the ID of the user who executed the command
        const response = await giveDailyCoins(interaction, userId);

        // Send the response
        if (typeof response === "string") {
            await interaction.followUp(response);
        } else {
            await interaction.followUp(response);
        }
    },
};

async function giveDailyCoins({ guild }, userId) {
    // ���� �� ���� ����
    if (guild.id !== '675018624452526110') {
        return;
    }

    // ��� �� ����� ������ ����� ������
    let targetUserData = await User.findOne({ guildId: guild.id, userId });

    if (!targetUserData) {
        // �� ������ �� ���� ���� �������, ��� ��� ���
        targetUserData = new User({
            guildId: guild.id,
            userId,
            coins: 0,
            lastDaily: 0 // ��� ����� �� ���� ������ �����
        });
    }

    // ���� �� ������ ��� ���� �� ������ ����� ����
    const currentTime = Date.now();
    if (targetUserData.lastDaily && (currentTime - targetUserData.lastDaily) < 86400000) {
        return "You have already claimed your daily coins today! Please try again tomorrow.";
    }

    // ��� ���� ������� ��� 20 �-200
    const dailyCoins = Math.floor(Math.random() * (200 - 20 + 1)) + 20;

    // ���� �� ���� ������ �� ������
    targetUserData.coins += dailyCoins;
    targetUserData.lastDaily = currentTime; // ���� �� ��� ������ ����� ������
    await targetUserData.save();

    // ��� �� ������ �� �-embed
    const embedColor = parseInt(EMBED_COLORS.SUCCESS.replace('#', '0x')); // Convert HEX to number
    const embed = {
        color: embedColor,
        title: "Daily Coins Reward",
        description: `You have received \`${dailyCoins}\` daily coins! Come back tomorrow for more.`,
    };

    // ���� �� �-embed ������ ������ �-safeReply
    return {
        embeds: [embed], // Must be an array
    };
}
