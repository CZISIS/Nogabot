const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
/**
 * @param {import('discord.js').GuildMember} member
 */
function getFlagsAsString(flags) {
    var result = "";
    for (var i = 0; i < flags.length; i++) {
        if (i + 1 == flags.length && flags[i] !== "EARLY_VERIFIED_DEVELOPER") {
            result += flags[i];
        } else if (flags[i] !== "EARLY_VERIFIED_DEVELOPER") {
            result += flags[i] + ", ";
        }
    }
    if (result === "") result = "`NONE`";

    // Replace badges with their respective icons
    return result
        .replace('PARTNERED_SERVER_OWNER', '<:ServerPartnerNew:797409335314874408>')
        .replace('HYPESQUAD_EVENTS', '<:HypeSquadEvents:797409333956706304>')
        .replace('BUGHUNTER_LEVEL_1', '<:BugHunter:792149619072434176>')
        .replace('HypeSquadOnlineHouse1', '<:Bravery:797409335289970698>')
        .replace('HypeSquadOnlineHouse2', '<:HOUSE_BRILLIANCE:797410137404604446>')
        .replace('HypeSquadOnlineHouse3', '<:HOUSE_BALANCE:797410137526239252>') // Updated here
        .replace('EARLY_SUPPORTER', '<:EarlySupporter:797409334249259038>')
        .replace('BUGHUNTER_LEVEL_2', '<:BugHunterV2:792149619131809832>')
        .replace('VERIFIED_BOT', '<:verified_bot:756518982181453884>')
        .replace('VERIFIED_DEVELOPER', '<a:developer_transparent:762287846613581854>');
} module.exports = (member) => {
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  let rolesString = member.roles.cache.map((r) => r.name).join(", ");
    if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...";
    const status = {
        online: "<:online:705102094578745361> **[Online]**",
        idle: "<:idle:705102094314635294> **[Idle]**",
        dnd: "<:dnd:705101884767207486> **[Do Not Disturb]**",
        offline: "<:offline:705102094260109476> **[Offline]**",
        streaming: "<:streaming:705102094595653682> **[Streaming]**"
    };

    // Assuming member is a valid GuildMember object
    let currentStatus = "No Status";

    // Check if the member has presence data
    if (member.presence) {
        // Use the status property to get the current status, defaulting to "offline" if not found
        currentStatus = status[member.presence.status] || status.offline;
    }
    let b2 = member.premiumSince;
    if (b2 === null) {
        b2 = "<:Fail:825698593461370880> Not Boosting";
    } else {
        b2 = "<:Success:825698556542451752> Boosting";
    }
    const trimArray = (arr, maxLen = 10) => {
        if (arr.length > maxLen) {
            const len = arr.length - maxLen;
            arr = arr.slice(0, maxLen);
            arr.push(` and ${len} more roles...`);
        }
        return arr;
    }
    const roles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1);
    const tools = {
        formatTime: function (time) {
            time = Number(String(time).replace(",", "")) / 1000;;

            let years = Math.floor(time / (12 * 4 * 7 * 24 * 60 * 60));
            time -= years * (12 * 4 * 7 * 24 * 60 * 60);
            let months = Math.floor(time / (4 * 7 * 24 * 60 * 60));
            time -= months * (4 * 7 * 24 * 60 * 60);
            let weeks = Math.floor(time / (7 * 24 * 60 * 60));
            time -= weeks * (7 * 24 * 60 * 60);
            let days = Math.floor(time / (24 * 60 * 60));
            time -= days * (24 * 60 * 60);
            let hours = Math.floor(time / (60 * 60));
            time -= hours * (60 * 60);
            let minutes = Math.floor(time / (60));
            time -= minutes * (60);
            let seconds = Math.floor(time);
            time -= seconds;

            let s = "";
            let m = "";
            let h = "";
            let d = "";
            let w = "";
            let mo = "";
            let y = "";

            if (seconds == 0) s = "0 Seconds";
            if (seconds > 1) s = `${seconds} Seconds`;
            if (seconds == 1) s = `${seconds} Second`;
            if (minutes > 1) m = `${minutes} Minutes`;
            if (minutes == 1) m = `${minutes} Minute`;
            if (hours > 1) h = `${hours} Hours`;
            if (hours == 1) h = `${hours} Hour`;
            if (days > 1) d = `${days} Days`;
            if (days == 1) d = `${days} Day`;
            if (weeks > 1) w = `${weeks} Weeks`;
            if (weeks == 1) w = `${weeks} Week`;
            if (months > 1) mo = `${months} Months`;
            if (months == 1) mo = `${months} Month`;
            if (years > 1) y = `${years} Years`;
            if (years == 1) y = `${years} Year`;

            let output = [y, mo, w, d, h, m, s];

            return output.filter(x => x !== "").join(", ");
        }
    }
    let b1 = member.premiumSince;
    if (b1 === null) {
        b1 = "<:Fail:825698593461370880> Not Boosting";
    } else {
        // b1 = `${member.premiumSince.toUTCString().substr(0, 16)} (${checkDays(member.premiumSince)})`;
        b1 = `${tools.formatTime(Date.now() - member.premiumSince)}`;
    }
    let boostedSince = b1 || "Not boosting";
  
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `User information for ${member.displayName}`,
      iconURL: member.user.displayAvatarURL(),
    })
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addFields(
      {
        name: "Username",
        value: member.user.username,
        inline: true,
      },
      {
        name: "ID",
        value: member.id,
        inline: true,
        },
        { name: "User Badges", value: getFlagsAsString(member.user.flags.toArray()), inline: false },

      {
        name: "Guild Joined",
        value: member.joinedAt.toUTCString(),
      },
      {
        name: "Discord Registered",
        value: member.user.createdAt.toUTCString(),
        },
        {
            name: "Status:",
            value: currentStatus, inline: true
        },
        {
            name: "Boosted Time Since:",
            value: boostedSince, inline: true
        },
      {
        name: `Roles [${member.roles.cache.size}]`,
          // value: rolesString,

            value: `${roles.length < 10 ? roles.join(", ") : roles.length > 10 ? trimArray(roles).join(", ") : roles.length == 10 ? roles.join(", ") : "None"}`, inline: false
       

      },
      {
        name: "Avatar-URL",
        value: member.user.displayAvatarURL({ extension: "png" }),
      }
    )
    .setFooter({ text: `Requested by ${member.user.tag}` })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
