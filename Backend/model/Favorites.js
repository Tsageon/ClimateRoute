const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemType: {
        type: String,
        enum: ['attraction', 'restaurant'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemType',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        required: true
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    },
    weatherSuggestion: {
        type: String  
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favorite', favoritesSchema);
