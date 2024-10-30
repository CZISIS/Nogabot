const mongoose = require("mongoose");

const backgroundSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    rankBackground: { type: String } // Background for the rank card
});

module.exports = mongoose.model("Background", backgroundSchema);
