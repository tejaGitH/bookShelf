const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    friendships: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Friendship',
        },
    ],
    sentRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Track users who received friend requests from this user
        },
    ],
    receivedRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Track users who sent friend requests to this user
        },
    ],
});

module.exports = mongoose.model('User', userSchema);