const { AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, IMAGE } = require("@root/config");
const { getBuffer } = require("@helpers/HttpUtils");
const { getMemberStats, getXpLb } = require("@schemas/MemberStats");
const Background = require("../../models/Background"); // Importing the background model

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "rank",
    description: "displays members rank in this server",
    cooldown: 5,
    category: "STATS",
    botPermissions: ["AttachFiles"],
    command: {
        enabled: true,
        usage: "[@member|id]",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "user",
                description: "target user",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ],
    },

    async messageRun(message, args, data) {
        const member = (await message.guild.resolveMember(args[0])) || message.member;
        const response = await getRank(message, member, data.settings);
        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members.fetch(user);
        const response = await getRank(interaction, member, data.settings);
        await interaction.followUp(response);
    },
};

async function getRank({ guild }, member, settings) {
    const { user } = member;
    if (!settings.stats.enabled) return "Stats Tracking is disabled on this server";

    const memberStats = await getMemberStats(guild.id, user.id);
    if (!memberStats || !memberStats.xp) return `${user.username} is not ranked yet!`;

    const lb = await getXpLb(guild.id, 100);
    let pos = lb.findIndex(doc => doc.member_id === user.id) + 1;

    const xpNeeded = memberStats.level * memberStats.level * 100;
    const rank = pos !== -1 ? pos : 0;

    // Fetch background from database
    const backgroundData = await Background.findOne({ guildId: guild.id });

    // Set the background based on what you fetch from the database
    const background = backgroundData ? backgroundData.rankBackground : EMBED_COLORS.DEFAULT_BACKGROUND; // Set a default if none exists
    const url = new URL(`${IMAGE.BASE_API}/utils/rank-card`);
    url.searchParams.append("name", user.username);
    if (user.discriminator != 0) url.searchParams.append("discriminator", user.discriminator);
    url.searchParams.append("avatar", user.displayAvatarURL({ extension: "png", size: 128 }));
    url.searchParams.append("currentxp", memberStats.xp);
    url.searchParams.append("reqxp", xpNeeded);
    url.searchParams.append("level", memberStats.level);
    url.searchParams.append("barcolor", EMBED_COLORS.BOT_EMBED);
   // url.searchParams.append("status", member?.presence?.status?.toString() || "idle");
    url.searchParams.append("status", member?.presence?.status?.toString() || "offline");
    url.searchParams.append("rank", rank);
    if (background) {
        const isHexColor = /^#[0-9A-F]{6}$/i.test(background);
        if (isHexColor) {
            url.searchParams.append("bgColor", background); // Pass HEX color
        } else {
            url.searchParams.append("bgImage", background); // If it's an image URL, use a different parameter
        }
    }
        if (!background) {
            url.searchParams.append("bgColor", "#23272a"); // Pass HEX color
        }


   // console.log(url.href); // Log the URL to ensure it's correct

    try {
        const response = await getBuffer(url.href, {
            headers: {
                Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
            },
        });

        if (!response.success) {
          //  console.error("Error response from API:", response);
            return `Failed to generate rank-card. Status: ${response.status}, Message: ${response.buffer.toString()}`;
        }

        const attachment = new AttachmentBuilder(response.buffer, { name: "rank.png" });
        return { files: [attachment] };
    } catch (error) {
      //  console.error("Error generating rank card:", error);
        return "An error occurred while generating the rank card.";
    }
}
