const { EmbedBuilder, escapeInlineCode, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getInvitesLb } = require("@schemas/Member");
const { getXpLb, getVoiceLb } = require("@schemas/MemberStats");
//const { getReputationLb } = require("@schemas/User");
const Premium = require("../../models/premiumModel"); // ייבוא המודל
const leaderboardTypes = ["xp", "invite", "voice"];

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "leaderboard",
  description: "display the XP, invite and voice leaderboard",
  category: "PREMIUM",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["lb"],
    minArgsCount: 1,
    usage: "<xp|invite|voice>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "type",
        description: "type of leaderboard to display",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: leaderboardTypes.map((type) => ({
          name: type,
          value: type,
        })),
      },
    ],
  },
    async messageRun(message, args, data) {

        let premiumData = await Premium.findOne({ guildId: message.guild.id });
      //  console.log("Fetched premium data:", premiumData);

        // אם השרת לא פרימיום, מחזיר הודעה מתאימה
        if (!premiumData || !premiumData.isPremium) {
            return message.reply({
                content: "This command is only available to premium servers.",
                ephemeral: true, // מוודא שההודעה תוצג רק למשתמש שהגיב
            });
        }
    const type = args[0].toLowerCase();
    let response;

    switch (type) {
      case "xp":
        response = await getXpLeaderboard(message, message.author, data.settings);
        break;
      case "invite":
        response = await getInviteLeaderboard(message, message.author, data.settings);
        break;
            // case "rep":
      /* case "voice":
        response = await getRepLeaderboard(message.author);
        break;*/
         case "voice":
            response = await getVoiceLeaderboard(message, message.author, data.settings);
          break;
      default:
           // response = "Invalid Leaderboard type. Choose either `xp`, `invite`or `rep`";
            response = "Invalid Leaderboard type. Choose either `xp`, `invite`or `voice`";
    }

    await message.safeReply(response);
  },

    async interactionRun(interaction, data) {
        let premiumData = await Premium.findOne({ guildId: interaction.guild.id });
     //   console.log("Fetched premium data:", premiumData);

        // אם השרת לא פרימיום, מחזיר הודעה מתאימה
        if (!premiumData || !premiumData.isPremium) {
            return interaction.followUp({
                content: "This command is only available to premium servers.",
                ephemeral: true, // מוודא שההודעה תוצג רק למשתמש שהגיב
            });
        }
    const type = interaction.options.getString("type");
    let response;

    switch (type) {
      case "xp":
        response = await getXpLeaderboard(interaction, interaction.user, data.settings);
        break;
      case "invite":
        response = await getInviteLeaderboard(interaction, interaction.user, data.settings);
        break;
   /*   case "rep":
        response = await getRepLeaderboard(interaction.user);
        break;*/
        case "voice":
            response = await getVoiceLeaderboard(interaction, interaction.user, data.settings);
            break;
      default:
        response = "Invalid Leaderboard type. Choose either `xp`, `invite`or `voice`";
    }
    await interaction.followUp(response);
  },
};

// Create a Map object to store cache entries
const cache = new Map();

async function getXpLeaderboard({ guild }, author, settings) {
  // Create a cache key using the guild ID and the type of leaderboard
  const cacheKey = `${guild.id}:xp`;

  // Check if there is a cached result for this request
  if (cache.has(cacheKey)) {
    // Return the cached result if it exists
    return cache.get(cacheKey);
  }

  if (!settings.stats.enabled) return "The leaderboard is disabled on this server";

  const lb = await getXpLb(guild.id, 10);
  if (lb.length === 0) return "There are no users in the leaderboard";

    let collector = "";
    let userPosition = null; // משתנה כדי לאחסן את המיקום שלך
  for (let i = 0; i < lb.length; i++) {
    try {
    /*  const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)}\n`;*/
        const user = await author.client.users.fetch(lb[i].member_id);
        const level = lb[i].level || 0; // בהנחה שיש עמודת level במודלים שלך
        const exp = lb[i].xp || 0; // בהנחה שיש עמודת xp במודלים שלך

        collector += `**${i + 1}.** ${user} | Level: \`${level}\` | Xp: \`${exp}\` \n`; // עיצוב לפי הדוגמה שלך
        if (user.id === author.id) {
            userPosition = i + 1; // מיקום הוא i + 1
        }

    } catch (ex) {
      // Ignore
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "XP Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
        .setFooter({ text: `Requested by ${author.username} | Your Position: ${userPosition ? userPosition : 'Not on the leaderboard'}` }); // הוספת המיקום ל-footer

  // Store the result in the cache for future requests
  cache.set(cacheKey, { embeds: [embed] });
  return { embeds: [embed] };
}

async function getInviteLeaderboard({ guild }, author, settings) {
  // Create a cache key using the guild ID and the type of leaderboard
  const cacheKey = `${guild.id}:invite`;

  // Check if there is a cached result for this request
  if (cache.has(cacheKey)) {
    // Return the cached result if it exists
    return cache.get(cacheKey);
  }

  if (!settings.invite.tracking) return "Invite tracking is disabled on this server";

  const lb = await getInvitesLb(guild.id, 10);
  if (lb.length === 0) return "There are no users in the leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const memberId = lb[i].member_id;
      if (memberId === "VANITY") collector += `**#${(i + 1).toString()}** - Vanity URL [${lb[i].invites}]\n`;
      else {
        const user = await author.client.users.fetch(lb[i].member_id);
        collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} [${lb[i].invites}]\n`;
      }
    } catch (ex) {
      collector += `**#${(i + 1).toString()}** - DeletedUser#0000 [${lb[i].invites}]\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
      .setFooter({ text: `Requested by ${author.username}` });

  // Store the result in the cache for future requests
  cache.set(cacheKey, { embeds: [embed] });
  return { embeds: [embed] };
}
function formatDuration(seconds) {
    const totalSeconds = Math.floor(seconds); // המרת שניות למספר שלם
    const days = Math.floor(totalSeconds / 86400); // 86400 שניות ביממה
    const hours = Math.floor((totalSeconds % 86400) / 3600); // 3600 שניות בשעה
    const minutes = Math.floor((totalSeconds % 3600) / 60); // 60 שניות בדקה
    const remainingSeconds = totalSeconds % 60; // חישוב השניות הנותרות

    // בנה את הפורמט הנדרש
    const parts = [];
    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`); // הוספת ימים
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`); // הוספת שעות
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`); // הוספת דקות
    }
    if (remainingSeconds > 0 || parts.length === 0) { // הוספת שניות רק אם יש
        parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`); // הוספת שניות
    }

    return parts.join(' '); // מחזיר את הפורמט הנדרש
}
async function getVoiceLeaderboard({ guild }, author, settings) {
    const cacheKey = `${guild.id}:voice`;

    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    if (!settings.stats.enabled) return "The leaderboard is disabled on this server";

    const lb = await getVoiceLb(guild.id, 10); // קבלת דירוג השיחות
    console.log("Voice leaderboard data:", lb); // לוג כאן
    if (lb.length === 0) return "There are no users in the voice leaderboard";

    let collector = "";
    for (let i = 0; i < lb.length; i++) {
        try {
            const user = await author.client.users.fetch(lb[i].member_id);
            const formattedTime = formatDuration(lb[i].time); // המרה לפורמט זמן
            collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)}: ${formattedTime}\n`; // הוספת הרשומה

      //      collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} - Time: ${lb[i].time} seconds\n`;
        } catch (ex) {
            // collector += `**#${(i + 1).toString()}** - DeletedUser#0000 - Time: ${lb[i].time} seconds\n`;
            const formattedTime = formatDuration(lb[i].time); // המרה לפורמט זמן
             collector += `**#${(i + 1).toString()}** - DeletedUser#0000 - Time: ${formattedTime} \n`;
        }
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: "Voice Leaderboard" })
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(collector)
        .setFooter({ text: `Requested by ${author.username}` });

    cache.set(cacheKey, { embeds: [embed] });
    return { embeds: [embed] };
}



/*async function getRepLeaderboard(author) {
  // Create a cache key using the user ID and the type of leaderboard
  const cacheKey = `${author.id}:rep`;

  // Check if there is a cached result for this request
  if (cache.has(cacheKey)) {
    // Return the cached result if it exists
    return cache.get(cacheKey);
  }

  const lb = await getReputationLb(10);
  if (lb.length === 0) return "There are no users in the leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} [${lb[i].rep}]\n`;
    } catch (ex) {
      collector += `**#${(i + 1).toString()}** - DeletedUser#0000 [${lb[i].rep}]\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Reputation Leaderboard" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Requested by ${author.tag}` });

  // Store the result in the cache for future requests
  cache.set(cacheKey, { embeds: [embed] });
  return { embeds: [embed] };
}*/
