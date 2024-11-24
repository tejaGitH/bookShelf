
const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' ,
    required: true,
    },
  book: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book' ,
    required: true,
    },
  progress: {
     type: Number, 
     default: 0 
    }, // percentage
  comments: { 
    type: String 
    },
  createdAt: {
    type: Date, 
    default: Date.now
 }
});

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);