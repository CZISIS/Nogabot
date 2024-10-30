const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "premium",
    description: "Information about premium features!",
    category: "UTILITY",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "",
    },
    slashCommand: {
        enabled: true,
        options: [],
    },
    async messageRun(message, args, data) {
        const premiumEmbed = new EmbedBuilder()
            .setTitle('<:gem:1297149465370558504> Upgrade to Premium! <:gem:1297149465370558504>')
            .setColor('#c660d6') // צבע זהב
            .setDescription('By upgrading to premium, you can unlock exclusive features that enhance your experience!')
            .addFields(
                {
                    name: "Premium Features!",
                    value: `- 📊 **Stats** Gain access to detailed statistics about your server’s activity and engagement!\n- 🔗 **Invites** Get insights into your server invites, including who invited whom!\n- ⚙️ **Custom Commands** Create custom commands tailored to your server needs for a more personalized experience!\n- 🎨 **Rank Background** Customize your user profiles with unique rank backgrounds to stand out!`, 

                    inline: false,
                },
            //   { name: '🔗 How to Upgrade?', value: 'To upgrade, please visit [our website](https://example.com) for more details!' }
                { name: '🔗 How to Upgrade?', value: 'To upgrade, please dm <@!719512505159778415> for more details!' }
            )
            .setFooter({ text: 'Thank you for supporting us!', iconURL: message.client.user.displayAvatarURL() }); // שים את הלוגו של הבוט

        return message.reply({ embeds: [premiumEmbed] });
    },

    async interactionRun(interaction) {
        const premiumEmbed = new EmbedBuilder()
            .setTitle('<:gem:1297149465370558504> Upgrade to Premium! <:gem:1297149465370558504>')
            .setColor('#c660d6') // צבע זהב
            .setDescription('By upgrading to premium, you can unlock exclusive features that enhance your experience!')
            .addFields(
                {
                    name: "Premium Features!",
                    //     value: `- Enjoy exclusive access to the **Stats** system to monitor your server's performance!\n- Utilize the **Invites** system to manage your community growth effectively!\n- Experience priority support and updates for premium users!`,
                    value: `- 📊 **Stats** Gain access to detailed statistics about your server’s activity and engagement!\n- 🔗 **Invites** Get insights into your server invites, including who invited whom!\n- ⚙️ **Custom Commands** Create custom commands tailored to your server needs for a more personalized experience!\n- 🎨 **Rank Background** Customize your user profiles with unique rank backgrounds to stand out!`, 
                    inline: false
                },
                { name: '🔗 How to Upgrade?', value: 'To upgrade, please dm <@!719512505159778415> for more details!' }
            )
            .setFooter({ text: 'Thank you for supporting us!', iconURL: interaction.client.user.displayAvatarURL() }); // שים את הלוגו של הבוט

        return interaction.followUp({ embeds: [premiumEmbed] });
    },
};
