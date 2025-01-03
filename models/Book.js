const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    about: { type: String, default: 'No description available' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentlyReading: { type: Boolean, default: false },
    status: { type: String, enum: ['reading', 'finished', 'not reading'], default: 'not reading' },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    isFriendBook: { type: Boolean, default: false }
}, {timestamps: true});

// Create text index on title and author fields
bookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', bookSchema);
