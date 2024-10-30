const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    // ����� �� ���� ������ �� �� ����
});

module.exports = mongoose.model('Guild', GuildSchema);
