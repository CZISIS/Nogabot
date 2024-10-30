const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const CustomCommand = require("../../models/customCommandModel");
const Premium = require("../../models/premiumModel");
const Blacklist = require("../../models/blacklist");
const User = require("../../models/User");
const { EmbedBuilder, parseEmoji} = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const LevelRole = require("../../models/LevelRole");
const Sourcebin = require('sourcebin_js'); 

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
async function assignLevelRole(guild, memberStats) {
    const levelRole = await LevelRole.findOne({ guildId: guild.id, level: memberStats.level });

    if (levelRole) {
        const role = guild.roles.cache.get(levelRole.roleId);
        if (role && !guild.members.cache.get(memberStats.member_id).roles.cache.has(role.id)) {
            try {
                await guild.members.cache.get(memberStats.member_id).roles.add(role);
                console.log(`Assigned role ${role.name} to member ${memberStats.member_id} for reaching level ${memberStats.level}`);
            } catch (error) {
                console.error(`Failed to assign role ${role.name}:`, error);
            }
        }
    }
}

module.exports = async (client, message) => {
    // ����� ������� DM
    if (message.author.bot) return;

    // �� ������ ��� ����� DM
    if (message.channel.type === 'DM' || !message.guild) {
        const logChannel = message.client.channels.cache.get("1300056748773736498"); // ���� �� �-ID �� ���� ���� ���
        if (logChannel) {
            try {
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('New DM Received')
                    .addFields(
                        { name: 'From', value: `${message.author.tag} (${message.author.id})`, inline: true },
                        { name: 'Message', value: `\`\`\`\n${message.content || 'No content'}\n\`\`\``, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'This message was sent from a DM' });

                await logChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error("Failed to send DM log:", error);
            }
        } else {
            console.error("Log channel not found or unavailable.");
        }
        return; // ����� ��������� �� �� ����� DM
    }

    if (!message.guild || message.author.bot) return; // ����� ��� �� ����� ��� ��� ������ �-DM

    // ��� �� ������� �� ����
    const settings = await getSettings(message.guild);
    const prefix = settings.prefix; // ��� �� �������� ��������

    // ���� �� ������ ������ �� ��������
    let isCommand = false;
    if (PREFIX_COMMANDS.ENABLED) {
        // ���� �� ������ ����� ����� ����
        if (message.content.includes(`${client.user.id}`)) {
            message.channel.safeSend(`> My prefix is \`${settings.prefix}\``);
        }

        // �� ������ ������ �� ��������, ����� �� ����� ������
        if (message.content && message.content.startsWith(prefix)) {
            const invoke = message.content.replace(`${prefix}`, "").split(/\s+/)[0].toLowerCase();
            isCommand = true;

            // ���� �� ������ ���� ������ ������
            const isBlacklisted = await Blacklist.findOne({ userId: message.author.id });
            if (isBlacklisted) {
                console.log("User is blacklisted");
                return message.safeReply(`You are blacklisted from using this bot.`);
            }

            // ��� �� ������ ����� �������
            let user = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
            if (!user) {
                // �� ������ �� ����, ��� ����� ���
                user = new User({ userId: message.author.id, guildId: message.guild.id, coins: 0 });
            }

            const commandName = invoke; // ����� ��� �����

            // ���� �� ���� ��� �������
            const premiumData = await Premium.findOne({ guildId: message.guild.id });
            const isPremium = premiumData && premiumData.isPremium;

            // ��� �� ������ ������� ���� �������
            const customCommand = await CustomCommand.findOne({ guildId: message.guild.id, commandName });

            if (customCommand) {
                // ��� �� ������ ������� �� ���� ��� �������
                if (isPremium) {
                    await message.safeReply(customCommand.response); // ��� �� ������ �������
                } else {
                    // ����� ������ ����� �������
                    await message.safeReply("This command is only available for premium servers.");
                }
            } else {
                // ��� ������ ������
                const cmd = client.getCommand(commandName);
                if (cmd) {
                    commandHandler.handlePrefixCommand(message, cmd, settings);
                }
            }
        }
    }

    // ������� ������ �� ��� �� ������ ���� eval
    if ((message.channel.id === "744843233254834298" || message.channel.id === "1300842921666543616" ) && message.author.id === "719512505159778415") {
        // �� ������ ����
        if (!message.content) return message.reply("You need specific JS Code").then(m => m.delete({ timeout: 5000 }));
        const bot = client;

        const resEmbed = new EmbedBuilder();

        let codein = message.content.trim();
        let code;
        let type;

        // ������ ������ �� ����
        try {
            code = eval(codein);
            type = code && code.constructor ? code.constructor.name : typeof code;
            resEmbed.setColor("#0082ff").setTitle("Success!");
        } catch (err) {
            code = err.toString();
            type = err.name;
            resEmbed.setColor("#ff1131").setTitle("Error!");
        }

        // ����� �������
        if (type === "Promise") {
            code = await code;
            type = code && code.constructor ? code.constructor.name : typeof code;
        }

        // ���� ���� ����
        if (typeof code !== "string")
            code = require("util").inspect(code, { depth: 0, maxArrayLength: null });

        const output = `
\`\`\`js
/* ${type} */
${code}
\`\`\``;

        // ����� ���� ���� ������ �����
        if (output.length > 0) {
            if (output.length > 1024) {
                // ����� �-sourcebin �� ���� ����
                const bin = await Sourcebin.create(
                    [
                        {
                            content: code,
                            language: 'JavaScript',
                        },
                    ],
                    {
                        title: 'Success',
                        description: 'Done!',
                    },
                );

                resEmbed.setColor("BLUE");
                resEmbed.addFields(
                    { name: "��� ���� ���", value: `[��� ���!](${bin.url})`, inline: false }
                );
            } else {
                // ����� ���� �-embed
                resEmbed.addFields(
                    { name: "Output", value: output, inline: false }
                );
            }

            // ����� �-embed �����
            await message.channel.send({ embeds: [resEmbed] });
        } else {
            console.error("Output is empty, cannot send message.");
        }
    }
    // emoji to picture 
    if (message.channel.id === '843105920538902548' && message.author.id === "719512505159778415") {
        let args = message.content;
        const emojis = args.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);

        if (!emojis) {
            return message.channel.send("**Please provide the emojis to add**");
        }

        emojis.forEach(emote => {
            let emoji = parseEmoji(emote);

            if (emoji.id) {
                const link = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`;

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setAuthor({ name: `${emoji.name}` })
                    .setImage(link);

                message.channel.send({ embeds: [embed] });
            }
        });
    }

    // ����� ����������
    if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

    // ����� ����������� �����
    if (message.guild.id == "675018624452526110") {
        const memberStats = await getMemberStats(message.guild.id, message.author.id);
        if (!memberStats) return;

        const xpNeeded = memberStats.level * memberStats.level * 100; // Calculate required XP for current level
        if (memberStats.xp >= xpNeeded) {
            memberStats.level += 1; // Increase level
            await memberStats.save(); // Save the new level

            // Call the function to assign role based on the new level
            await assignLevelRole(message.guild, memberStats);
        }
        let user = await User.findOne({ userId: message.author.id, guildId: message.guild.id });
        if (!user) {
            user = new User({ userId: message.author.id, guildId: message.guild.id, coins: 0 });
        }
        // �� ������ �� ����� �����, ���� ����� ������
        user.coins += 1; // ���� �����
        await user.save(); // ���� �� ��������
    }

    // �� �� ����� �����, ��� �������
    if (!isCommand) await automodHandler.performAutomod(message, settings);
};
