require("dotenv").config();
require("module-alias/register");

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");
const Discord = require("discord.js");
const DBL = require('dblapi.js');

validateConfiguration();

// initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

(async () => {
  // check for updates
  await checkForUpdates();

  // start the dashboard
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");

      // let the dashboard initialize the database
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // initialize the database
    await initializeMongoose();
  }

  // start the client
  await client.login(process.env.BOT_TOKEN);
})();
/*
const dbltoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI2NDgxMTYxMzcwODc0Njc1MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNDgzMDk5MjAwfQ.8tpNASxdSsfkVF7YparhyV1Ouy5ORQ3AM2jitd_Y-PI'
const dbl = new DBL(dbltoken, { webhookPort: 5000, webhookAuth: "JKFGLDASJIOWEPNJLCVDAS" })*/
/*https://discord.com/api/webhooks/790250279048183850/VEytJUTzGlKdZUPrwAB799H6IWUqAJ1bNyIX4yOC656cnjCScB9eJQQyMFTlC-6yPDpg*/
/*dbl.webhook.on('vote', (vote) => {
    console.log(`User with ID ${vote.user} just voted!`);

    // Create a webhook client
    const webhook = new Discord.WebhookClient({
        id: "797456587727568907",
        token: "kxPY49wbPJHgJjuw-SqTCQLca-_KDQ-uO8HQl1BW9okh8ktCBLhGlQg7EMMFCJOGx5Lw"
    });

    // Create an embed message
    const embed = new Discord.MessageEmbed()
      //  .setAuthor("XRooN Vote", "https://cdn.discordapp.com/attachments/746462160028172348/790250933053292574/a62a05260fb30160effb7bfec3ef3cb7.png", "https://top.gg/bot/786975444561297510/vote")
        .setDescription(`New Vote!\n Mention: <@${vote.user}>\nID: \`${vote.user}\`\nThanks!`)
        .setColor("BLUE")
        .setTimestamp()
        .setFooter(client.user.username, client.user.displayAvatarURL());

    // Send the embed via webhook
    webhook.send({ embeds: [embed] });
});*/