const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    friend:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status:{
        type: String,
        enum: ['pending','accepted','declined']
    }
});

module.exports = mongoose.model('Friendship',friendshipSchema);