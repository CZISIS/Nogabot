/* eslint-disable no-const-assign */
const { CommandCategory, BotClient } = require("@src/structures");
const { EMBED_COLORS, SUPPORT_SERVER } = require("@root/config.js");
const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    Message,
    ButtonBuilder,
    CommandInteraction,
    ApplicationCommandOptionType,
    ButtonStyle,
} = require("discord.js");
const { getCommandUsage, getSlashUsage } = require("@handlers/command");
const Premium = require('../../models/premiumModel'); // נניח ש-help.js נמצא בתיקיית commands

const CMDS_PER_PAGE = 5;
const IDLE_TIMEOUT = 30;
let prefixforembed = "";
/**
 * @param {object} settings
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "help",
    description: "command help menu",
    category: "UTILITY",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "[command]",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "command",
                description: "name of the command",
                required: false,
                type: ApplicationCommandOptionType.String,
            },
        ],
    },

    async messageRun(message, args, data) {
        const trigger = args[0];
        prefixforembed = data.prefix;
        // !help
        if (!trigger) {
            const response = await getHelpMenu(message);
            const sentMsg = await message.safeReply(response);
            return waiter(sentMsg, message.author.id, data.prefix);
        }

        // check if command help (!help cat)
        const cmd = message.client.getCommand(trigger);
        if (cmd) {
            if (cmd.category === "SHOP" && message.guild.id !== "675018624452526110") {
                return;
            }
            if (cmd.category === "OWNER" && message.author.id !== "719512505159778415") {
                return;
            }
            const embed = getCommandUsage(cmd, data.prefix, trigger);
            return message.safeReply({ embeds: [embed] });
        }

        // No matching command/category found
        await message.safeReply("No matching command found");
    },

    async interactionRun(interaction) {
        const cmdName = interaction.options.getString("command");
        prefixforembed = "/";
        // !help
        if (!cmdName) {
            const response = await getHelpMenu(interaction, interaction.user.id);
            const sentMsg = await interaction.followUp(response);
            return waiter(sentMsg, interaction.user.id);
        }

        // check if command help (!help cat)
        const cmd = interaction.client.slashCommands.get(cmdName);
        if (cmd) {
            if (cmd.category === "SHOP" && interaction.guild.id !== "675018624452526110") {
                return;/* interaction.followUp("This command is not available on this server.");*/
            }
            if (cmd.category === "OWNER" && interaction.user.id !== "719512505159778415") {
                return;/* interaction.followUp("This command is not available on this server.");*/
            }
            const embed = getSlashUsage(cmd);
            return interaction.followUp({ embeds: [embed] });
        }

        // No matching command/category found
        await interaction.followUp("No matching command found");
    },
};

/**
 * @param {CommandInteraction} params.interaction
 * @param {string} prefix
 */
async function getHelpMenu({ client, guild }) {
    // Menu Row
   /* const { user } = interaction;*/

    const options = Object.entries(CommandCategory)
        .filter(([, v]) => v.enabled !== false)
        .filter(([k]) => k !== "SHOP" || guild.id === "675018624452526110") // הוסף את הבדיקה הזו
/*        .filter(([k]) => k !== "OWNER" || user.id === "719512505159778415") // בודק אם המשתמש הוא הבוט*/
        .map(([k, v]) => ({
            label: v.name,
            value: k,
            description: `View commands in ${v.name} category`,
            emoji: v.emoji,
        }));

    const menuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("help-menu")
            .setPlaceholder("Choose the command category")
            .addOptions(options)
    );

    // Buttons Row
    const components = [
    /*    new ButtonBuilder()
            .setCustomId("firstPageBtn")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),*/
        new ButtonBuilder()
            .setCustomId("previousBtn")
            //  .setEmoji("⬅️")
            .setEmoji("<:previus:1297142985032470560>") 
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId("homeBtn")
            // .setEmoji("🏠")
            .setEmoji("<:home:1297142986723033148>")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId("nextBtn")
            // .setEmoji("➡️")
            .setEmoji("<:next:1297142983262732338>") 
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
       /* new ButtonBuilder()
            .setCustomId("lastPageBtn")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),*/
    ];

    const buttonsRow = new ActionRowBuilder().addComponents(components);
    const premiumData = await Premium.findOne({ guildId: guild.id });

    const embedDescription = [
        `**About Me:**\n` +
        `Hello, I am ${guild.members.me.displayName}!\n` +
        // "A cool multipurpose discord bot which can serve all your needs\n\n" +
         "Your ultimate companion for managing and enjoying your Discord server!\n\n" +
        `**🔗 Useful Links:**\n` +
        `**<:lossless1:1299385619675353208>Invite Me:** [Click Here](${client.getInvite()})\n` +
        `**<:lossless2:1299385617511219251>Join Our Support Server:** [Join Here](${SUPPORT_SERVER})`
        //`**Invite Me:** [Here](${client.getInvite()})\n` +
        //`**Support Server:** [Join](${SUPPORT_SERVER})`
    ];

    const embed = new EmbedBuilder()
        .setColor(0x0099FF) // צבע חדש (כחול בהיר)
    //    .setTitle("🎉 Welcome to My Help Menu!")
        .setThumbnail(client.user.displayAvatarURL()) // תמונת תצוגה
        .setDescription(embedDescription.join(''))
        .setTimestamp() // זמן יצירת ההודעה
     //   .setFooter({ text: `Powered by ${client.user.username} | ${prefixforembed}help <command>`, iconURL: client.user.displayAvatarURL() }); // פוטר עם השם של הבוט
        .setFooter({ text: `${prefixforembed}help <command> for more command information`, iconURL: client.user.displayAvatarURL() }); // פוטר עם השם של הבוט
    // הוסף שדות אם השרת בפרימיום

      /*  .setDescription(
            `**About Me:**\n` +
            `Hello, I am ${guild.members.me.displayName}!\n` +
            "A cool multipurpose discord bot which can serve all your needs\n\n" +
            `**Invite Me:** [Here](${client.getInvite()})\n` +
            `**Support Server:** [Join](${SUPPORT_SERVER})`
    );*/
    if (premiumData && premiumData.isPremium) {
        /* embedDescription.push(
             `\n**Premium Features:**\n` +
             `- The **Stats** system is available for premium servers. Use the command to enable it!\n` +
             `- The **Invites** system is also available for premium servers. Use the command to enable it!`
         );*/
      /* embed.addFields(
            { name: "🌟 Premium Features:", value: `- The **Stats** system is available for premium servers. Use the command to enable it!\n- The **Invites** system is also available for premium servers. Use the command to enable it!`, inline: false }
        );*/
        embed.addFields(
            {
                name: "<:gem:1297149465370558504> Welcome to Premium Features!",
                //     value: `- Enjoy exclusive access to the **Stats** system to monitor your server's performance!\n- Utilize the **Invites** system to manage your community growth effectively!\n- Experience priority support and updates for premium users!`,
                value: `- Access the **Stats** system for server performance!\n- Manage growth with the **Invites** system!\n- Get priority support and updates!`, 
                inline: false
            }
        );
    }
    return {
        embeds: [embed],
        components: [menuRow, buttonsRow],
     //  components: [menuRow],
    };
}

/**
 * @param {Message} msg
 * @param {string} userId
 * @param {string} prefix
 */
const waiter = (msg, userId, prefix) => {
    const collector = msg.channel.createMessageComponentCollector({
        filter: (reactor) => reactor.user.id === userId && msg.id === reactor.message.id,
        idle: IDLE_TIMEOUT * 1000,
        dispose: true,
        time: 5 * 60 * 1000,
    });

    let arrEmbeds = [];
    let currentPage = 0;
    let menuRow = msg.components[0];
    let buttonsRow = msg.components[1];

   /* const updateMessage = async () => {
        const totalPages = arrEmbeds.length; // חשב את מספר העמודים
        const pageIndicator = totalPages > 0 ? `Page ${currentPage + 1}/${totalPages}` : `Page 1/1`; // עדכן את האינדיקטור

        await msg.edit({
         //   embeds: [arrEmbeds[currentPage]], // העמוד הנוכחי
            components: [menuRow, buttonsRow],
            // אין צורך בתוכן כאן, פשוט מעדכן את הפוטר
            embeds: [arrEmbeds[currentPage].setFooter({ text: `${prefix}help <command> | ${pageIndicator}`, iconURL: msg.client.user.displayAvatarURL() })]
        });
    };
    */
    collector.on("collect", async (response) => {
      //  if (!["help-menu", "firstPageBtn", "previousBtn", "homeBtn", "nextBtn", "lastPageBtn"].includes(response.customId)) return;
          if (!["help-menu", "previousBtn", "homeBtn", "nextBtn"].includes(response.customId)) return;
        await response.deferUpdate();
        const member = response.member;

        switch (response.customId) {
            case "help-menu": {
                const cat = response.values[0].toUpperCase();
                if (cat === "OWNER" && userId !== "719512505159778415") {
                    return;
                }
                if (cat === "ADMIN" && !member.permissions.has("Administrator")) {
                    return response.followUp({
                        content: "Only the administrator can access this category.",
                        ephemeral: true,
                    });
                }

                const isPremiumCategory = ["PREMIUM", "INVITE", "STATS"].includes(cat);
                const premiumStatus = await Premium.findOne({ guildId: msg.guild.id });
                console.log(premiumStatus);

                if (isPremiumCategory && (!premiumStatus || !premiumStatus.isPremium)) {
                    return response.followUp({
                        content: "This category is only available to premium servers.",
                        ephemeral: true,
                    });
                }

                arrEmbeds = prefix ? getMsgCategoryEmbeds(msg.client, cat, prefix, msg.guild) : getSlashCategoryEmbeds(msg.client, cat, msg.guild);
                currentPage = 0;
            /*    buttonsRow.components[0].setDisabled(arrEmbeds.length <= 1); // Disable 'previous' if single page
                buttonsRow.components[2].setDisabled(arrEmbeds.length <= 1); // Disable 'next' if single page*/


                // עדכון כפתורים
                let components = buttonsRow.components.map(button =>
                    ButtonBuilder.from(button).setDisabled(arrEmbeds.length <= 1)
                );
                components[1] = ButtonBuilder.from(components[1]).setDisabled(false); // Assuming homeBtn is at index 2
                buttonsRow = new ActionRowBuilder().addComponents(components);
                msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
                break;
            }

            case "previousBtn":
                if (currentPage > 0) {
                    currentPage--;
                    buttonsRow.components[0].setDisabled(currentPage === 0); // Disable if at first page
                    buttonsRow.components[2].setDisabled(false); // Enable 'next' if not on last page

                    msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
                  //  await updateMessage(); // עדכן את ההודעה עם העמוד החדש
                }
                break;

            case "homeBtn": {
                const response = await getHelpMenu(msg);
                await msg.edit(response);
            }
                break;

            case "nextBtn":

                if (currentPage < arrEmbeds.length - 1) {
                  /*  buttonsRow.components[0] = ButtonBuilder.from(buttonsRow.components[0]).setDisabled(currentPage === 0); // previousBtn
                    buttonsRow.components[2] = ButtonBuilder.from(buttonsRow.components[2]).setDisabled(currentPage >= arrEmbeds.length - 1); // nextBtn*/
                    currentPage++;
                    buttonsRow.components[0].setDisabled(false);
                    buttonsRow.components[2].setDisabled(currentPage >= arrEmbeds.length - 1); // Disable if at last page
                    msg.editable && (await msg.edit({ embeds: [arrEmbeds[currentPage]], components: [menuRow, buttonsRow] }));
                  //  await updateMessage(); // עדכן את ההודעה עם העמוד החדש
                }
                break;

            // במקרה של כפתורים נוספים (כמו "firstPageBtn" ו-"lastPageBtn"), תוכל להוסיף את הלוגיקה שלך כאן.
        }
    });

    collector.on("end", () => {
        if (!msg.guild || !msg.channel) return;
        return msg.editable && msg.edit({ components: [] });
    });
   }
/**
 * Returns an array of message embeds for a particular command category [SLASH COMMANDS]
 * @param {BotClient} client
 * @param {string} category
 */
function getSlashCategoryEmbeds(client, category, guild) {
    let collector = "";

    if (category === "SHOP" && guild.id !== "675018624452526110") {
        // אם זה לא השרת שלך, נחזיר Embed ריק
        return  [
            new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setThumbnail(CommandCategory[category]?.image)
                .setAuthor({ name: `${category} Commands` })
                .setDescription("This category is not available on this server.")

        ];
    }
    // For IMAGE Category
    if (category === "IMAGE") {
        client.slashCommands
            .filter((cmd) => cmd.category === category)
            .forEach((cmd) => (collector += `\`/${cmd.name}\`\n ❯ ${cmd.description}\n\n`));

        const availableFilters = client.slashCommands
            .get("filter")
            .slashCommand.options[0].choices.map((ch) => ch.name)
            .join(", ");

        const availableGens = client.slashCommands
            .get("generator")
            .slashCommand.options[0].choices.map((ch) => ch.name)
            .join(", ");

        collector +=
            "**Available Filters:**\n" + `${availableFilters}` + `*\n\n**Available Generators**\n` + `${availableGens}`;

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.BOT_EMBED)
            .setThumbnail(CommandCategory[category]?.image)
            .setAuthor({ name: `${category} Commands` })
            .setDescription(collector);

        return [embed];
    }

    // For REMAINING Categories
    const commands = Array.from(client.slashCommands.filter((cmd) => cmd.category === category).values());

    if (commands.length === 0) {
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.BOT_EMBED)
            .setThumbnail(CommandCategory[category]?.image)
            .setAuthor({ name: `${category} Commands` })
            .setDescription("No commands in this category");

        return [embed];
    }

    const arrSplitted = [];
    const arrEmbeds = [];

    while (commands.length) {
        let toAdd = commands.splice(0, Math.min(commands.length, CMDS_PER_PAGE));

        toAdd = toAdd.map((cmd) => {
            const subCmds = cmd.slashCommand.options?.filter((option) => option.type === 1) || [];
            let subCommand = subCmds.length ? subCmds.map((sc) => `> /${cmd.name} ${sc.name} \n ❯ ${sc.description}`) : [];

            return `> /${cmd.name}\n ❯ ${cmd.description}` + (subCommand.length ? "\n" + subCommand.join("\n") : "");
        });

        arrSplitted.push(toAdd.join("\n\n"));
    }

    arrSplitted.forEach((v, index) => {
        arrEmbeds.push(
            new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setThumbnail(CommandCategory[category]?.image)
                .setAuthor({ name: `${category} Commands` })
                .setDescription(v)
                .setFooter({ text: ` /help <command> • Page ${index + 1} of ${arrSplitted.length}`, iconURL: client.user.displayAvatarURL() }) // פוטר עם השם של הבוט
        );
    });

    return arrEmbeds;
}

/**
 * Returns an array of message embeds for a particular command category [MESSAGE COMMANDS]
 * @param {BotClient} client
 * @param {string} category
 * @param {string} prefix
 */
function getMsgCategoryEmbeds(client, category, prefix, guild) {
    if (category === "SHOP" && guild.id !== "675018624452526110") {
        // אם זה לא השרת שלך, נחזיר Embed ריק
        return [
            new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setAuthor({ name: `${category} Commands` })
                .setDescription("This category is not available on this server.")
        ];
    }
    const commands = Array.from(client.commands.filter((cmd) => cmd.category === category).values());
    if (commands.length === 0) {
        return [new EmbedBuilder()
            .setColor(EMBED_COLORS.BOT_EMBED)
            .setAuthor({ name: `${category} Commands` })
            .setDescription("No commands in this category")];
    }

    const arrEmbeds = [];
    const arrSplitted = [];

    while (commands.length) {
        let toAdd = commands.splice(0, Math.min(commands.length, CMDS_PER_PAGE));
        arrSplitted.push(
            toAdd.map((cmd) => `> ${prefix}${cmd.name} ${cmd.command.usage || ""}\n ❯ ${cmd.description}`).join("\n\n")
        );
    }

    arrSplitted.forEach((v, index) => {
        arrEmbeds.push(
            new EmbedBuilder()
                .setColor(EMBED_COLORS.BOT_EMBED)
                .setAuthor({ name: `${category} Commands` })
                .setDescription(v)
                .setFooter({ text: ` ${prefix}help <command> • Page ${index + 1} of ${arrSplitted.length}`, iconURL: client.user.displayAvatarURL() }) // פוטר עם השם של הבוט
        );
    });

    return arrEmbeds;
}
