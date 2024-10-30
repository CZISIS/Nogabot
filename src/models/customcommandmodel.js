const mongoose = require('mongoose');

const CustomCommandSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
    },
    commandName: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
});

// ���� �� ����� ��� ����, �� ��, ���� ����
const CustomCommand = mongoose.models.CustomCommand || mongoose.model('CustomCommand', CustomCommandSchema);

module.exports = CustomCommand;
