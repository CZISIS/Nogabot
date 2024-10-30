const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "emojilist",
    description: "Displays a list of all custom emojis in the server.",
    category: "ADMIN",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
    },
    async messageRun(message) {
        await runEmojiList(message, message.author, message.channel);
    },
    async interactionRun(interaction) {
        await interaction.deferReply();
        await runEmojiList(interaction, interaction.user, interaction.channel);
    },
};

async function runEmojiList(context, user, channel) {
    const emojis = context.guild.emojis.cache;
    if (!emojis.size) return context.safeReply("This server has no custom emojis.");

    let emojiList = [];
    emojis.forEach(emoji => {
        emojiList.push(`${emoji} \`:${emoji.name}:\` \`${emoji.id}\``);
    });

    const splitEmojis = chunkArray(emojiList, 10); // Split the list into chunks of 10
    const totalPages = splitEmojis.length;

    let currentPage = 0;
    const embed = generateEmbed(splitEmojis, currentPage, totalPages, user);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('previous')
            .setEmoji("<:previus:1297142985032470560>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji("<:next:1297142983262732338>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(totalPages === 1)
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== user.id) {
            return interaction.reply({ content: "These buttons are not for you!", ephemeral: true });
        }

        if (interaction.customId === 'next' && currentPage < totalPages - 1) {
            currentPage++;
        } else if (interaction.customId === 'previous' && currentPage > 0) {
            currentPage--;
        }

        const newEmbed = generateEmbed(splitEmojis, currentPage, totalPages, user);

        const updatedRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji("<:previus:1297142985032470560>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji("<:next:1297142983262732338>")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages - 1)
        );

        await interaction.update({ embeds: [newEmbed], components: [updatedRow] });
    });

    collector.on('end', () => {
        msg.edit({ components: [] });
    });
}

// Utility function to chunk an array into smaller arrays
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

// Function to generate embed
function generateEmbed(pages, pageIndex, totalPages, user) {
    return new EmbedBuilder()
        .setTitle(`Custom Emojis - Page ${pageIndex + 1}/${totalPages}`)
        .setDescription(pages[pageIndex].join("\n"))
        .setColor("#0082ff")
        .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() });
}
