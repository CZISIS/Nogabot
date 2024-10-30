const Blacklist = require("../../models/blacklist"); // ייבוא המודל
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "blacklist",
    description: "Add or remove users from the blacklist",
    category: "OWNER",
    command: {
        enabled: true,
        usage: "<add/remove/list> <user-id> [reason]",
        minArgsCount: 1,
    },
    async messageRun(message, args) {
        const botOwnerId = "719512505159778415"; // Replace this with your own Discord user ID
        if (message.author.id !== botOwnerId) {
            return;
        }
        const action = args[0].toLowerCase();


        if (action === "add") {
            const userId = args[1];
            const reason = args.slice(2).join(" ") || "No reason provided";
            // הוספה ל-blacklist
            let user = await Blacklist.findOne({ userId });
            if (user) return message.safeReply("This user is already blacklisted.");

            user = new Blacklist({ userId, reason });
            await user.save();
            return message.safeReply(`User ${userId} has been blacklisted for: ${reason}`);
        }

        if (action === "remove") {
            const userId = args[1];
            // הסרה מה-blacklist
            const user = await Blacklist.findOneAndDelete({ userId });
            if (!user) return message.safeReply("This user is not in the blacklist.");

            return message.safeReply(`User ${userId} has been removed from the blacklist.`);
        }
        if (action === "list") {
            // List all blacklisted users
            const users = await Blacklist.find(); // Get all blacklisted users
            if (users.length === 0) {
                return message.safeReply("The blacklist is currently empty.");
            }

            const chunkSize = 5; // Number of users to display per page
            const pages = Math.ceil(users.length / chunkSize);
            let currentPage = 0;

            // Function to create the embed for the current page
            const createEmbedPage = async (page) => {
                const start = page * chunkSize;
                const end = start + chunkSize;
                const currentUsers = users.slice(start, end);

                // Fetch usernames for the current users
                const userPromises = currentUsers.map(async (user) => {
                  /*  try {
                        const fetchedUser = await message.client.users.fetch(user.userId);
                        return `(${user.userId}) - Name: ${fetchedUser.username} - Reason: ${user.reason}`;
                    } catch (err) {
                        return `(${user.userId}) - Name: Unknown - Reason: ${user.reason}`; // Fallback if user fetch fails
                    }*/
                    try {
                        const fetchedUser = await message.client.users.fetch(user.userId);
                        return `${fetchedUser.username}(${user.userId}) - Reason: ${user.reason}`;
                    } catch (err) {
                        return `Unknown(${user.userId}) - Reason: ${user.reason}`; // Fallback if user fetch fails
                    }
                });

                const userDescriptions = await Promise.all(userPromises);

                const embed = new EmbedBuilder()
                    .setTitle("Blacklisted Users")
                    .setColor("#FF0000") // Set your desired color
                    .setDescription(userDescriptions.join("\n") || "No users found.")
                    .setFooter({ text: `Page ${currentPage + 1} of ${pages}` });

                return embed;
            };

            // Create buttons for pagination
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("previousBlc")
                        .setEmoji("<:previus:1297142985032470560>")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0), // Disable if on first page
                    new ButtonBuilder()
                        .setCustomId("nextBlc")
                        .setEmoji("<:next:1297142983262732338>") 
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === pages - 1) // Disable if on last page
                );

            const msg = await message.safeReply({ embeds: [await createEmbedPage(currentPage)], components: [row] });

            // Create a collector to handle button clicks
            const filter = (interaction) => {
                return interaction.user.id === message.author.id;
            };

            const collector = msg.createMessageComponentCollector({ filter, time: 60000 }); // 60 seconds timeout

            collector.on('collect', async (interaction) => {
                if (interaction.customId === "nextBlc") {
                    currentPage++;
                } else if (interaction.customId === "previousBlc") {
                    currentPage--;
                }

                // Update the embed and button states
                await interaction.update({ embeds: [await createEmbedPage(currentPage)], components: [row] });

                // Update button states based on the current page
                row.components[0].setDisabled(currentPage === 0);
                row.components[1].setDisabled(currentPage === pages - 1);
            });

            collector.on('end', () => {
                row.components.forEach(button => button.setDisabled(true)); // Disable all buttons after time expires
                msg.edit({ components: [row] }); // Update the message with disabled buttons
            });

            return; // Exit the command after setting up the embed and buttons
        }

        message.safeReply("Invalid action. Use `add`, `remove`, or `list`.");
    },
};
