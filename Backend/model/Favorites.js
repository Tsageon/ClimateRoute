const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemType: {
        type: String,
        enum: ['restaurant', 'attraction','tourist_attraction',
            'point_of_interest', 'establishment', 'museum'],
        required: false
    },
    itemId: {
        type: String,
        unique: true,
        required: false
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
