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
        type : number,
        required: true,
        minimum : 1,
        maximum : 5,
    },
});

module.exports = mongoose.model('Book',bookSchema); //??\



