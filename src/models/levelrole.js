const mongoose = require('mongoose');

const levelRoleSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    level: { type: Number, required: true },
    roleId: { type: String, required: true },
});

module.exports = mongoose.model('LevelRole', levelRoleSchema);
