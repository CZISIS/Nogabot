const { EmbedBuilder } = require("discord.js");
const { getSettings } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */
module.exports = async (client, guild) => {
  if (!guild.available) return;
  client.logger.log(`Guild Left: ${guild.name} Members: ${guild.memberCount}`);

  const settings = await getSettings(guild);
  settings.data.leftAt = new Date();
  await settings.save();

  if (!client.joinLeaveWebhook) return;

  let ownerTag;
  const ownerId = guild.ownerId || settings.data.owner;
  try {
    const owner = await client.users.fetch(ownerId);
    ownerTag = owner.tag;
  } catch (err) {
    ownerTag = "Deleted User";
  }

  const embed = new EmbedBuilder()
    //  .setTitle("Guild Left")
      .setTitle(`**Left the Server!**`)

    .setThumbnail(guild.iconURL())
      .setColor(client.config.EMBED_COLORS.ERROR)
      .setAuthor({ name: `${client.guilds.cache.size} Servers`, iconURL: client.user.displayAvatarURL() })
    .addFields(
      {
        name: "Guild Name",
        value: guild.name || "NA",
        inline: false,
      },
      {
          name: "Guild",
        value: guild.id,
        inline: false,
      },
      {
        name: "Owner",
        value: `${ownerTag} [\`${ownerId}\`]`,
        inline: false,
      },
     /* {
        name: "Members",
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: false,
      }*/
        {
            name: "Users",
            value: `${guild.memberCount}`,
            inline: false,
        },
    )
    //   .setFooter({ text: `Guild #${client.guilds.cache.size}` });
        .setFooter({ text: `Guild ID: ${guild.id}` })

  client.joinLeaveWebhook.send({
    username: "Leave",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [embed],
  });
};
