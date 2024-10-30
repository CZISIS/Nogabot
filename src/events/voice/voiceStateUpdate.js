const { trackVoiceStats } = require("@handlers/stats");
const voiceSchema = require("../../models/voice");
const channelSchema = require("../../models/voiceChannels");
const Discord = require('discord.js');

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').VoiceState} oldState
 * @param {import('discord.js').VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
    // Track voice stats
    trackVoiceStats(oldState, newState);

    // Erela.js - בדיקת מוזיקה
    if (client.config.MUSIC.ENABLED) {
        const guild = oldState.guild;

        // אם אף אחד לא עזב את החדר הנוכחי, חזור
        if (oldState.channelId !== guild.members.me.voice.channelId || newState.channel) return;

        // אחרת, בדוק כמה אנשים נמצאים בחדר עכשיו
        if (oldState.channel.members.size === 1) {
            setTimeout(() => {
                // אם יש אחד (אתה), המתן דקה
                if (oldState.channel.members.size - 1 === 0) {
                    const player = client.musicManager.getPlayer(guild.id);
                    if (player) {
                        client.musicManager.destroyPlayer(guild.id).then(() => player.disconnect()); // השמד את השחקן
                    }
                }
            }, client.config.MUSIC.IDLE_TIME * 1000);
        }
    }

    const guildID = newState.guild.id;

    // ודא שהפקודה מתבצעת רק בשרת שלך
    if (guildID !== '675018624452526110') return; // ID של השרת שלך

    try {
        const data = await voiceSchema.findOne({ Guild: guildID });

        if (data) {
            // מחיקת חדר אם הוא ריק
            const data2 = await channelSchema.findOne({ Guild: guildID, Channel: oldState.channelId });
            if (data2) {
                const channel = client.channels.cache.get(data2.Channel);
                if (channel && channel.members.size === 0) {
                    if (data.ChannelCount) {
                        data.ChannelCount -= 1;
                        await data.save();
                    }

                    await channelSchema.deleteOne({ Channel: oldState.channelId });
                    await channel.delete().catch(err => console.error(`Failed to delete voice channel: ${err}`));
                }
            }

            // יצירת חדר חדש למשתמש שנכנס לערוץ יצירת חדרים
            if (newState.channel && newState.channel.id === data.Channel) {
                const user = await client.users.fetch(newState.id);
                const member = newState.guild.members.cache.get(user.id);

                // עדכון מונה החדרים
                if (data.ChannelCount) {
                    data.ChannelCount += 1;
                } else {
                    data.ChannelCount = 1;
                }
                await data.save();

                // יצירת חדר חדש
                let channelName = data.ChannelName;
                channelName = channelName
                    .replace(`{emoji}`, "🔊")
                    .replace(`{channel name}`, `Voice ${data.ChannelCount}`)
                    .replace(`{channel count}`, `${data.ChannelCount}`)
                    .replace(`{member}`, `${user.username}`)
                    .replace(`{member tag}`, `${user.tag}`);

                const newChannel = await newState.guild.channels.create({
                    name: channelName,
                    type: Discord.ChannelType.GuildVoice,
                    parent: data.Category,
                });

                await member.voice.setChannel(newChannel); // העבר את המשתמש לחדר החדש

                // שמירת המידע על החדר החדש במסד הנתונים
                await new channelSchema({
                    Guild: guildID,
                    Channel: newChannel.id,
                }).save();
            }
        }
    } catch (err) {
        console.error(`Failed to handle voice state update: ${err}`);
    }
};
