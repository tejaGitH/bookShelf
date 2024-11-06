
const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
    },
  book: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book' 
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