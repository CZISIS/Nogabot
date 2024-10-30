/* eslint-disable no-case-declarations */
const { getSettings } = require("@schemas/Guild");
const { commandHandler, contextHandler, statsHandler, suggestionHandler, ticketHandler } = require("@src/handlers");
const { InteractionType } = require("discord.js");
const Blacklist = require("../../models/blacklist"); // Assuming you have a model for blacklisted users

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').BaseInteraction} interaction
 */
module.exports = async (client, interaction) => {
    if (!interaction.guild) {
        return interaction
            .reply({ content: "Command can only be executed in a discord server", ephemeral: true })
            .catch(() => { });
    }

    const userId = interaction.user.id;

    // Check if the user is blacklisted
    const blacklisted = await Blacklist.findOne({ userId });
    if (blacklisted) {
        return interaction.reply({
            content: "You are blacklisted from using this bot.",
            ephemeral: true,
        });
    }

    // Slash Commands
    if (interaction.isChatInputCommand()) {
        await commandHandler.handleSlashCommand(interaction);
    }

    // Context Menu
    else if (interaction.isContextMenuCommand()) {
        const context = client.contextMenus.get(interaction.commandName);
        if (context) await contextHandler.handleContext(interaction, context);
        else return interaction.reply({ content: "An error has occurred", ephemeral: true }).catch(() => { });
    }

    // Buttons
    else if (interaction.isButton()) {
        switch (interaction.customId) {
            case "TICKET_CREATE":
                return ticketHandler.handleTicketOpen(interaction);

            case "TICKET_CLOSE":
                return ticketHandler.handleTicketClose(interaction);

            case "SUGGEST_APPROVE":
                return suggestionHandler.handleApproveBtn(interaction);

            case "SUGGEST_REJECT":
                return suggestionHandler.handleRejectBtn(interaction);

            case "SUGGEST_DELETE":
                return suggestionHandler.handleDeleteBtn(interaction);

            case "bug_fixed": // טיפול בכפתור "bug_fixed"
                // מחק את ההודעה המקורית
                try {
                    const originalMessage = await interaction.channel.messages.fetch(interaction.message.id);
                    if (originalMessage) {
                        await originalMessage.delete(); // מחיקת ההודעה המקורית
                    }
                } catch (error) {
                    console.error("Error fetching or deleting the original message:", error);
                }

                // מענה מיידי על אינטראקציה
                await interaction.deferUpdate(); // This acknowledges the button interaction immediately

                await interaction.followUp({ content: 'Bug marked as fixed!', ephemeral: true });

                // שלח הודעה פרטית למשתמש
                try {
                    await interaction.user.send(`The reported bug has been marked as fixed!`); // שליחת הודעה פרטית
                } catch (error) {
                    console.error("Error sending DM to user:", error);
                    await interaction.followUp({ content: "Could not send you a direct message.", ephemeral: true });
                }

                // שלח הודעה חדשה לערוץ
              //  await interaction.channel.send(`The reported bug has been marked as fixed!`); // שלח הודעה חדשה לערוץ
                break;
        }
    }

    // Modals
    else if (interaction.type === InteractionType.ModalSubmit) {
        switch (interaction.customId) {
            case "SUGGEST_APPROVE_MODAL":
                return suggestionHandler.handleApproveModal(interaction);

            case "SUGGEST_REJECT_MODAL":
                return suggestionHandler.handleRejectModal(interaction);

            case "SUGGEST_DELETE_MODAL":
                return suggestionHandler.handleDeleteModal(interaction);
        }
    }

    const settings = await getSettings(interaction.guild);

    // track stats
    if (settings.stats.enabled) statsHandler.trackInteractionStats(interaction).catch(() => { });
};
