const { EmbedBuilder } = require('discord.js');
const categories = require('../../structures/CommandCategory'); // עדכן את המיקום
const Premium = require("../../models/premiumModel"); // Importing the premium model

async function getPremium(guildId) {
    try {
        const premiumData = await Premium.findOne({ guildId });
        console.log("Fetched premium data:", premiumData);
        return premiumData; // Return premium data
    } catch (error) {
        console.error(`Failed to fetch premium data for guild ${guildId}:`, error);
        return null; // Return null instead of throwing an error
    }
}

module.exports = {
    name: "settings",
    description: "Displays the enabled categories.",
    category: "ADMIN",
    userPermissions: ["ManageGuild"],
    botPermissions: ["EmbedLinks"],

    cooldown: 5,
    command: {
        enabled: true,
        usage: "",
    },
    slashCommand: {
        enabled: true,
    },

    async messageRun(message) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Settings for : ${message.guild.name}`, iconURL: message.guild.iconURL() }) // שימוש בכותרת עם אובייקט
            .setColor('Blurple');

        const isOwnerServer = message.guild.id === "675018624452526110"; // עדכן את מזהה השרת שלך
        let isPremium = false;

        try {
            const premiumData = await getPremium(message.guild.id);
            isPremium = premiumData;
            console.log("Premium data for guild:", premiumData);
            console.log("Is this server premium?", isPremium);
        } catch (error) {
            console.error(error);
        }

        for (const key in categories) {
            const category = categories[key];

            if (category.name === "Shop" && !isOwnerServer) continue;
            if (category.name === "Premium" && !isPremium) continue;

            if (category.enabled) {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }

                );
            }
            if (category.name === "Anime" || category.name === "Fun" || category.name === "Information" || category.name === "Utility") {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
                continue; // עבור לקטגוריה הבאה
            }
            if (category.name === "Owner" && message.author.id === "719512505159778415") {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
            }
            if (category.name === "Premium" && isPremium) {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
            }
        }

        await message.safeReply({ embeds: [embed] });
    },

    async interactionRun(interaction) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Settings for : ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() }) // שימוש בכותרת עם אובייקט

            .setColor('Blurple');

        const isOwnerServer = interaction.guild.id === "675018624452526110"; // עדכן את מזהה השרת שלך
        let isPremium = false;

        try {
            const premiumData = await getPremium(interaction.guild.id);
            isPremium = premiumData;
            console.log("Premium data for guild:", premiumData);
            console.log("Is this server premium?", isPremium);
        } catch (error) {
            console.error(error);
        }

        for (const key in categories) {
            const category = categories[key];

            if (category.name === "Shop" && !isOwnerServer) continue;
            if (category.name === "Premium" && !isPremium) continue;

            if (category.enabled) {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
            }
            if (category.name === "Anime" || category.name === "Fun" || category.name === "Information" || category.name === "Utility") {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
                continue; // עבור לקטגוריה הבאה
            }
            if (category.name === "Owner" && interaction.user.id === "719512505159778415") {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
            }
            if (category.name === "Premium" && isPremium) {
                embed.addFields(
                    { name: `${category.emoji} ${category.name}`, value: "Enabled", inline: true }
                );
            }
        }

        await interaction.followUp({ embeds: [embed] });
    },
};
