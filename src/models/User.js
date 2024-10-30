const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    coins: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('User', UserSchema);
