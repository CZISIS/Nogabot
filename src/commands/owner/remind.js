const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "remind",
    description: "Set a reminder for yourself",
    category: "OWNER",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: 'time',
                description: 'The time in seconds for the reminder',
                type: 3, // STRING type
                required: true,
            },
            {
                name: 'message',
                description: 'The reminder message',
                type: 3, // STRING type
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        if (message.author.id !== '719512505159778415') {
            return;
        }

        const time = args[0];
        const reminderMessage = args.slice(1).join(' ');

        const response = await setReminder(message.author, time, reminderMessage);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        if (interaction.user.id !== '719512505159778415') {
            return;
        }

        const time = interaction.options.getString('time');
        const reminderMessage = interaction.options.getString('message');

        const response = await setReminder(interaction.user, time, reminderMessage);
        await interaction.followUp(response);
    },
};

async function setReminder(user, time, reminderMessage) {
    const timeInSeconds = parseInt(time);
    if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
        return "Please provide a valid number for time in seconds.";
    }

    // הודעת אישור
    const embed = new EmbedBuilder()
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setDescription(`I will remind you in ${timeInSeconds} seconds with the message: "${reminderMessage}"`);

    // קביעת טיימר לשליחת ההודעה
    setTimeout(() => {
        user.send(`⏰ Reminder: ${reminderMessage}`);
    }, timeInSeconds * 1000);

    return { embeds: [embed] };
}
