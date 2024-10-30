// src/models/premiumModel.js
const mongoose = require("mongoose");

const premiumSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    isPremium: { type: Boolean, default: false },
});

module.exports = mongoose.model("Premium", premiumSchema);
