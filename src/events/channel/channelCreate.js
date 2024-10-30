const { EmbedBuilder, ChannelType, AuditLogEvent } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Channel} channel
 */
module.exports = async (client, channel) => {
    // ��� ����� ���� ���� ������ ���� ������� ��
    const targetGuildId = "792778956230623287"; // ���� ��� �� �-ID �� ���� ��� ��� ���� �����
    if (channel.guild.id !== targetGuildId) return; // �� ���� �� ���� ���� �����, ����

    // ���� �� ���� ��� ��� ����
//    if (channel.type !== ChannelType.GuildText) return;

  //  client.logger.log(`Channel Created: ${channel.name} in Guild: ${channel.guild.name}`);

    // ����� ����
    await registerGuild(channel.guild);

    // ��� ��� �� Webhook �����
    if (!client.nogalogs) return;

    // ��� �� �-Entry ������ ��� ����� �� ��� �� ����
    const fetchedLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate, // ����� ����� ����� ���
    });

    const entry = fetchedLogs.entries.first();

    // ��� �� �� ����� �� ��� ����� ������
    const creatorInfo = entry ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown Creator";
    let channelType;
    switch (channel.type) {
        case ChannelType.GuildText:
            channelType = "Text Channel";
            break;
        case ChannelType.GuildVoice:
            channelType = "Voice Channel";
            break;
        case ChannelType.GuildCategory:
            channelType = "Category";
            break;
        case ChannelType.GuildNews:
            channelType = "News Channel";
            break;
        case ChannelType.GuildStore:
            channelType = "Store Channel";
            break;
        // ���� ��� ����� ������ �� ��
        default:
            channelType = "Unknown Type";
            break;
    }
    // ����� �-embed
    const channelcembed = new EmbedBuilder()
        .setColor('#00A56A')
        .setAuthor({ name: `Channel Created`, iconURL: client.user.avatarURL() })
        .addFields(
            { name: "**Name:**", value: `${channel.name}`, inline: true },
            { name: "**Type:**", value: `${channelType}`, inline: true },
            // { name: "**Channel Topic:**", value: `\`${channel.topic === null ? "None" : channel.topic}\``, inline: true },
            { name: "**ID:**", value: `${channel.id}`, inline: true },
            { name: "**Created By:**", value: creatorInfo, inline: true } // ����� ����� ����� �����
        )
        .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })
        .setTimestamp();

    // ��� �� ���� �-WebHook
    client.nogalogs.send({
        username: "Channel Log",
        avatarURL: client.user.displayAvatarURL(),
        embeds: [channelcembed],
    });
};
