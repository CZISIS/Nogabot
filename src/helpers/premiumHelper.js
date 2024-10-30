const PremiumModel = require("../models/premiumModel"); // import the premium model

/**
 * Function to check if the server is premium
 * @param {string} guildId - The ID of the guild (server)
 * @returns {Promise<boolean>} - Returns true if the server is premium, false otherwise
 */
async function isPremium(guildId) {
    const guildData = await PremiumModel.findOne({ guildId });
    return guildData ? guildData.isPremium : false; // Return the isPremium field or false if not found
}

module.exports = { isPremium };
