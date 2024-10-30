const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { timeformat } = require("@helpers/Utils");
const settings = require("../../admin/settings");
/*const os = require("os");
const { stripIndent } = require("common-tags");*/


/**
 * @param {import('@structures/BotClient')} client
 */
/*const getGuildSettings = async (guildID) => {
    // חפש את הגילד ב-MongoDB
    const guildSettings = await Guild.findOne({ _id: guildID }); 
    const prefix = guildSettings ? guildSettings.prefix : 'n!';

    return prefix;
};*/
module.exports = (client) => {
    // STATS
    const guilds = client.guilds.cache.size;
    const channels = client.channels.cache.size;
    const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);
    /*
    // CPU
    const platform = process.platform.replace(/win32/g, "Windows");
    const architecture = os.arch();
    const cores = os.cpus().length;
    const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;
  
    // RAM
    const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
    const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
    const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;
  
    const overallUsed = `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
    const overallAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
    const overallUsage = `${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`;*/
    let ownernoga = client.users.cache.get('719512505159778415')
    let bot = client;
    const joineddiscord = (bot.user.createdAt.getDate()) + '/' + (bot.user.createdAt.getMonth() + 1) + '/' + bot.user.createdAt.getFullYear() + ' • ' + bot.user.createdAt.getHours() + ':' + bot.user.createdAt.getMinutes() + ':' + bot.user.createdAt.getSeconds();


    let desc = "";
    desc += `❒ Total guilds: ${guilds}\n`;
    desc += `❒ Total users: ${users}\n`;
    desc += `❒ Total channels: ${channels}\n`;
    desc += `❒ Websocket Ping: ${client.ws.ping} ms\n`;
    desc += "\n";

    const embed = new EmbedBuilder()
        .setTitle("Bot Information")
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(desc)
     .addFields(
       /*   {
              name: "**Prefix**",
              value: `${getGuildSettings(guildID)}`,
              value: `${getGuildSettings(guildID)}`,
              inline: true,
          },*/
    {
        name: "**Created At**",
            value: `${joineddiscord} (${timeformat(Date.now() - client.user.createdTimestamp)} ago)`,
                inline: true,
          },
    {
        name: "**Bot Owner**",
            value: `<@719512505159778415>\n(${ownernoga.tag})`,
                inline: true,
          },

    /* {
       name: "CPU",
       value: stripIndent`
       ❯ **OS:** ${platform} [${architecture}]
       ❯ **Cores:** ${cores}
       ❯ **Usage:** ${cpuUsage}
       `,
       inline: true,
     },
     {
       name: "Bot's RAM",
       value: stripIndent`
       ❯ **Used:** ${botUsed}
       ❯ **Available:** ${botAvailable}
       ❯ **Usage:** ${botUsage}
       `,
       inline: true,
     },
     {
       name: "Overall RAM",
       value: stripIndent`
       ❯ **Used:** ${overallUsed}
       ❯ **Available:** ${overallAvailable}
       ❯ **Usage:** ${overallUsage}
       `,
       inline: true,
     },*/
    {
        name: "Node Js version",
            value: process.versions.node,
                inline: false,
      },
    {
        name: "Uptime",
            value: "```" + timeformat(process.uptime()) + "```",
                inline: false,
      }
    );

    // Buttons
    let components = [];
    components.push(new ButtonBuilder().setLabel("Invite Link").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

    if (SUPPORT_SERVER) {
        components.push(new ButtonBuilder().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
    }

    if (DASHBOARD.enabled) {
        components.push(
            new ButtonBuilder().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
        );
    }

    let buttonsRow = new ActionRowBuilder().addComponents(components);

    return { embeds: [embed], components: [buttonsRow] };
};
