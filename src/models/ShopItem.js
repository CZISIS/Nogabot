const mongoose = require('mongoose');

const ShopItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    emoji: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('ShopItem', ShopItemSchema);
