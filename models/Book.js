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
       // required: true,
        minimum : 1,
        maximum : 5,
    },
    about: {  // Add "about" field
        type: String,
        default: 'No description available',
    },
    userId: {  // Add userId to associate the book with a user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currentlyReading: { 
        type: Boolean ,
        default: false,
    },
    status:{
        type: String,
        enum: ['reading','finished','not reading'],
        default: 'not reading',
    }
});

module.exports = mongoose.model('Book',bookSchema); //??\



