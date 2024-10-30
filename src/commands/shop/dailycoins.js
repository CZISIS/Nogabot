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
    // בדוק אם השרת תקין
    if (guild.id !== '675018624452526110') {
        return;
    }

    // קבל את נתוני המשתמש מהמסד נתונים
    let targetUserData = await User.findOne({ guildId: guild.id, userId });

    if (!targetUserData) {
        // אם המשתמש לא קיים במסד הנתונים, צור ערך חדש
        targetUserData = new User({
            guildId: guild.id,
            userId,
            coins: 0,
            lastDaily: 0 // זמן אחרון של קבלת הקוינס היומי
        });
    }

    // בדוק אם המשתמש כבר קיבל את הקוינס היומי היום
    const currentTime = Date.now();
    if (targetUserData.lastDaily && (currentTime - targetUserData.lastDaily) < 86400000) {
        return "You have already claimed your daily coins today! Please try again tomorrow.";
    }

    // בחר מספר רנדומלי בין 20 ל-200
    const dailyCoins = Math.floor(Math.random() * (200 - 20 + 1)) + 20;

    // עדכן את יתרת הקוינס של המשתמש
    targetUserData.coins += dailyCoins;
    targetUserData.lastDaily = currentTime; // עדכן את זמן הקוינס היומי האחרון
    await targetUserData.save();

    // צור את ההודעה עם ה-embed
    const embedColor = parseInt(EMBED_COLORS.SUCCESS.replace('#', '0x')); // Convert HEX to number
    const embed = {
        color: embedColor,
        title: "Daily Coins Reward",
        description: `You have received \`${dailyCoins}\` daily coins! Come back tomorrow for more.`,
    };

    // החזר את ה-embed בפורמט שמתאים ל-safeReply
    return {
        embeds: [embed], // Must be an array
    };
}
