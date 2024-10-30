const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config"); // שנה את הנתיב הזה לפי הצורך
const secrets = [process.env.TOKEN]; // טוקנים סודיים
const DUMMY_TOKEN = "MY_TOKEN_IS_SECRET"; // טוקן חלופי להגנה

// פונקציה להחלפת סודיים עם "Hidden"
const replaceSecrets = (str, hid = "Hidden") => {
    secrets.forEach(s => {
        if (typeof str === "string" && s) {
            str = str.replace(s, hid);
        }
    });
    return str;
};

module.exports = {
    name: "eval",
    description: "Evaluates a piece of JavaScript code.",
    category: "OWNER",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "<script>",
        minArgsCount: 1,
        aliases: ["evaluate", "evalute", "e"],
    },
    slashCommand: {
        enabled: false,
        options: [
            {
                name: "expression",
                description: "Content to evaluate",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        const botOwnerId = "719512505159778415"; // המזהה שלך בדיסקורד
        if (message.author.id !== botOwnerId) return;

        const input = args.join(" ");
        if (!input) return message.safeReply("Please provide code to eval");

        const resEmbed = new EmbedBuilder();
        let output, type;

        const evalContext = {
            client: message.client,
            bot: message.client,
            message: message,
            interaction: null,
        };

        try {
            // הוספת return כדי לוודא שהפלט יחזור
            output = await eval(`(async () => { return ${input} })()`.replace(/client|bot/g, (match) => `evalContext.${match}`));
            type = output && output.constructor ? output.constructor.name : typeof output;
            resEmbed.setColor("#0082ff").setTitle("Success!");
        } catch (err) {
            output = err.toString();
            type = err.name;
            resEmbed.setColor("#ff1131").setTitle("Error!");
        }

        // אם הפלט הוא Promise, המתן לו
        if (type === "Promise") {
            output = await output;
            type = output && output.constructor ? output.constructor.name : typeof output;
        }

        // עיבוד הפלט
        if (typeof output !== "string") {
            output = require("util").inspect(output, { depth: 0, maxArrayLength: null });
        }
        output = output.replace(/`/g, "`\u2004");
        const formattedOutput = `
\`\`\`js
/* ${type} */
${replaceSecrets(output)}
\`\`\``;

        // בדוק אם הפלט ארוך מדי
        if (formattedOutput.length > 1024) {
            const url = "https://hastebin.com";
            const res = await fetch(`${url}/documents`, {
                method: "POST",
                body: output,
                headers: { "Content-Type": "text/plain" }
            });

            if (!res.ok) throw new Error(res.statusText);

            const { key } = await res.json();
            resEmbed.setColor("BLUE");
            resEmbed.addFields({
                name: "Output too long",
                value: `[Click here!](${url}/${key}.js)`,
                inline: false,
            });
        } else {
            resEmbed.addFields({
                name: "Output",
                value: formattedOutput,
                inline: false,
            });
        }

        await message.safeReply({ embeds: [resEmbed] });
    },

    

    async interactionRun(interaction) {
        const input = interaction.options.getString("code");

        // Check if the user is the bot owner
        const botOwnerId = "719512505159778415"; // המזהה שלך בדיסקורד
        if (interaction.user.id !== botOwnerId) return;

        const resEmbed = new EmbedBuilder();
        let output, type;

        const evalContext = {
            client: interaction.client,
            bot: interaction.client,
            interaction: interaction,
        };

        try {
            output = await eval(`(async () => { return ${input} })()`.replace(/client|bot/g, (match) => `evalContext.${match}`));
            type = output && output.constructor ? output.constructor.name : typeof output;
            resEmbed.setColor("#0082ff").setTitle("Success!");
        } catch (err) {
            output = err.toString();
            type = err.name;
            resEmbed.setColor("#ff1131").setTitle("Error!");
        }

        if (type === "Promise") {
            output = await output;
            type = output && output.constructor ? output.constructor.name : typeof output;
        }

        if (typeof output !== "string") {
            output = require("util").inspect(output, { depth: 0, maxArrayLength: null });
        }
        output = output.replace(/`/g, "`\u2004");
        const formattedOutput = `
\`\`\`js
/* ${type} */
${replaceSecrets(output)}
\`\`\``;

        if (formattedOutput.length > 1024) {
            const url = "https://hastebin.com";
            const res = await fetch(`${url}/documents`, {
                method: "POST",
                body: output,
                headers: { "Content-Type": "text/plain" }
            });

            if (!res.ok) throw new Error(res.statusText);

            const { key } = await res.json();
            resEmbed.setColor("BLUE");
            resEmbed.addFields({
                name: "Output too long",
                value: `[Click here!](${url}/${key}.js)`,
                inline: false,
            });
        } else {
            resEmbed.addFields({
                name: "Output",
                value: formattedOutput,
                inline: false,
            });
        }

        await interaction.followUp({ embeds: [resEmbed] });
    },
};

const buildSuccessResponse = (output, client) => {
    output = require("util").inspect(output, { depth: 0 }).replaceAll(client.token, DUMMY_TOKEN);

    const embed = new EmbedBuilder()
        .setAuthor({ name: "📤 Output" })
        .setDescription("```js\n" + (output.length > 4096 ? `${output.substr(0, 4000)}...` : output) + "\n```")
        .setColor("Random")
        .setTimestamp();

    return { embeds: [embed] };
};

const buildErrorResponse = (err) => {
    const embed = new EmbedBuilder();
    embed
        .setAuthor({ name: "📤 Error" })
        .setDescription("```js\n" + (err.length > 4096 ? `${err.substr(0, 4000)}...` : err) + "\n```")
        .setColor(EMBED_COLORS.ERROR)
        .setTimestamp();

    return { embeds: [embed] };
};
