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
    // הוספה של שדות נוספים אם יש צורך
});

module.exports = mongoose.model('Guild', GuildSchema);
