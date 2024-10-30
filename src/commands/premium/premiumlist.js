const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Premium = require("../../models/premiumModel"); // ייבוא המודל
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "listpremium",
    description: "List all guilds that have premium enabled.",
    cooldown: 5,
    category: "OWNER",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
    },

    async messageRun(message) {
        const ownerId = "719512505159778415"; // ID של הבעלים

        // בדוק אם המשתמש הוא הבעלים
        if (message.author.id !== ownerId) {
            return;
        }
        await listPremiumGuilds(message);
    },

    async interactionRun(interaction) {
        await listPremiumGuilds(interaction);
    },
};

// פונקציה למציאת השרתים שיש להם פרימיום
async function listPremiumGuilds(interaction) {
    const premiumData = await Premium.find({ isPremium: true }).exec();

    if (premiumData.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.ERROR)
            .setDescription("There are no servers with premium enabled.");
        return interaction.reply({ embeds: [embed] }); // ודא שהתשובה היא אובייקט
    }

    // דף ראשון
    const pageSize = 5; // מספר השרתים להציג בכל דף
    let currentPage = 0;

    const totalPages = Math.ceil(premiumData.length / pageSize);
    await sendEmbed(interaction, premiumData, currentPage, totalPages);
}

// פונקציה לשליחת ה-Embed עם דף השרתים
async function sendEmbed(interaction, premiumData, currentPage, totalPages) {
    const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("Premium Guilds")
        .setDescription("Here are the servers with premium:")
        .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` }) // ודא שהפוטור הוא אובייקט
        .setTimestamp();

    // הוספת השרתים להודעה
    const startIndex = currentPage * 5;
    const endIndex = Math.min(startIndex + 5, premiumData.length);

    const guildList = await Promise.all(
        premiumData.slice(startIndex, endIndex).map(async (guild) => {
            try {
                // ניסיון לקבל את מידע השרת
                const guildInfo = await interaction.client.guilds.fetch(guild.guildId);
                return `**Name:** ${guildInfo.name} (ID: ${guild.guildId})`;
            } catch (error) {
                // אם יש שגיאה, מחזירים הודעה חלופית
                console.error(`Failed to fetch guild info for ID ${guild.guildId}:`, error);
                return `**Name:** Unknown (ID: ${guild.guildId})`;
            }
        })
    );

    embed.setDescription(guildList.join("\n") || "No servers found."); // צור רשימה של השרתים

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous_page')
                .setLabel('Previous Page')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0), // Disable if on first page
            new ButtonBuilder()
                .setCustomId('next_page')
                .setLabel('Next Page')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage >= totalPages - 1) // Disable if on last page
        );

    const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    // הוספת אירוע לניהול הכפתורים
    const filter = (buttonInteraction) => buttonInteraction.user.id === interaction.user.id;
    const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
        await buttonInteraction.deferUpdate(); // עדכון מצב הכפתור

        // עדכון currentPage
        if (buttonInteraction.customId === 'previous_page' && currentPage > 0) {
            currentPage--;
        } else if (buttonInteraction.customId === 'next_page' && currentPage < totalPages - 1) {
            currentPage++;
        }

        // עדכון ה-embed והכפתורים
        await updateEmbed(interaction, premiumData, currentPage, totalPages, row);
    });

    collector.on('end', () => {
        row.components.forEach(button => button.setDisabled(true));
        interaction.editReply({ components: [row] }); // Disable buttons when the collector ends
    });
}

// פונקציה חדשה לעדכון ה-embed
async function updateEmbed(interaction, premiumData, currentPage, totalPages, row) {
    const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setTitle("Premium Guilds")
        .setDescription("Here are the servers with premium:")
        .setFooter({ text: `Page ${currentPage + 1} of ${totalPages}` }) // ודא שהפוטור הוא אובייקט
        .setTimestamp();

    const startIndex = currentPage * 5;
    const endIndex = Math.min(startIndex + 5, premiumData.length);

    const guildList = await Promise.all(
        premiumData.slice(startIndex, endIndex).map(async (guild) => {
            try {
                const guildInfo = await interaction.client.guilds.fetch(guild.guildId);
                return `**Name:** ${guildInfo.name} (ID: ${guild.guildId})`;
            } catch (error) {
                console.error(`Failed to fetch guild info for ID ${guild.guildId}:`, error);
                return `**Name:** Unknown (ID: ${guild.guildId})`;
            }
        })
    );

    embed.setDescription(guildList.join("\n") || "No servers found."); // צור רשימה של השרתים

    // עדכון ה-embed והכפתורים
    await interaction.editReply({ embeds: [embed], components: [row] }); // Use `editReply` to update the message
}
