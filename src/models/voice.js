const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
    Guild: {
        type: String,
        required: true,
    },
    Category: {
        type: String,
        required: true,
    },
    Channel: {
        type: String,
        required: true,
    },
    ChannelName: {
        type: String,
        default: "{emoji} {channel name}",
    },
    ChannelCount: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("voice", voiceSchema);
