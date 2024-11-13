const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title:{
        type : String,
        required: true,
    },
    author: {
        type : String,
        required: true,
    },
    rating: {
        type : Number,
        required: true,
        minimum : 1,
        maximum : 5,
    },
    // userId: {  // Add userId to associate the book with a user
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true,
    // },
});

module.exports = mongoose.model('Book',bookSchema); //??\



