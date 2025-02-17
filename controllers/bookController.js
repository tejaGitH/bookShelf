const api = require("../middleware/api");
const Book = require("../models/Book");
const User = require("../models/User");
const ReadingProgress = require("../models/ReadingProgress");
const Friendship = require('../models/Friendship');
const mongoose = require('mongoose');


const getBestSellers = async (req, res) => {
  const list = req.params.list;
  const maxRetries = 3;
  let retryDelay = 500; // 500ms
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const data = await api.getBestSellers(list);
      res.json(data);
      return;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Rate limit exceeded. Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      } else {
        console.error('Error fetching best sellers:', error);
        break;
      }
    }
  }
  
  res.status(500).json({ message: 'Failed to retrieve best sellers' });

  // const maxRetries = 3;
  // const retryDelay = 500; // 500ms

  // for (let i = 0; i <= maxRetries; i++) {
  //   try {
  //     const data = await api.getBestSellers(list);
  //     res.json(data);
  //     return;
  //   } catch (error) {
  //     if (error.response.status === 429) {
  //       console.log(`Rate limit exceeded. Retrying in ${retryDelay}ms...`);
  //       await new Promise(resolve => setTimeout(resolve, retryDelay));
  //       retryDelay *= 2; // exponential backoff
  //     } else {
  //       throw error;
  //     }
  //   }
  // }

  // res.status(500).json({ message: 'Failed to retrieve best sellers' });
};

const getBookDetails = async(req,res)=>{
    const isbn = req.params.isbn;
    console.log(isbn);
    try{
        const data = await api.getBookDetails(isbn);
        res.json(data);
    }catch(error){
        res.status(500).json({message:'Error fetching Book details'});
    }
}

const searchBooks =async(req,res)=>{
    const query = req.params.query;
    //console.log(query);
    try{
        const data = await api.searchBooks(query);
        //console.log(data);
        res.json(data);
    }catch(error){
      console.error('Error searching books:', error);
        res.status(500).json({message:'Error searching books'});
    }
}

// const addBook = async(req,res)=>{
//     try{
//         // const {title, author, rating} = req.body;
//         // console.log(req.body);
//         // const newBook = new Book({title,author,rating});
//         // const savedBook = await newBook.save();
//         // res.json(savedBook);
//     }catch(error){
//         res.status(500).json({message:'Failed to addbook', error :error.message})
//     }
// }
// Search user and friends' books based on name and author
const searchUserAndFriendsBooks = async (req, res) => {
  const query = req.params.query;
  try {
      // Debugging userId
      console.log("User ID:", req.userId);

      // Create a case-insensitive regex for partial matches
      const regex = new RegExp(query, 'i');

      // Fetch user books
      const userBooks = await Book.find({ 
          $or: [
              { title: regex },
              { author: regex }
          ],
          userId: req.userId 
      });
      console.log("User Books:", userBooks);

      // Fetch friends
      const friends = await User.find({ friendships: req.userId });
      console.log("Friends:", friends);

      // Fetch friends' books
      const friendsBooks = await Book.find({ 
          userId: { $in: friends.map(friend => friend._id) },
          $or: [
              { title: regex },
              { author: regex }
          ]
      });
      console.log("Friends' Books:", friendsBooks);

      const data = {
          userBooks,
          friendsBooks
      };

      res.json(data);
  } catch (error) {
      console.error("Error searching user and friends books:", error);
      res.status(500).json({ message: 'Error searching user and friends books', error: error.message });
  }
};


const searchUserBooks = async (req, res) => {
  const query = req.params.query;
  try {
      const userBooks = await Book.find({ $text: { $search: query }, userId: req.userId });

      console.log("User Books:", userBooks);

      res.json(userBooks);
  } catch (error) {
      console.error("Error searching user books:", error);
      res.status(500).json({ message: 'Error searching user books', error: error.message });
  }
};





// Search people
const searchPeople = async (req, res) => {
    const query = req.params.query;
    try {
        // Example logic to search for people based on name or other criteria
        const people = await User.find({ $text: { $search: query } });
        res.json(people);
    } catch (error) {
        res.status(500).json({ message: 'Error searching people' });
    }
};





const addBook = async (req, res) => {
    try {
        const { title, author, rating, about, image} = req.body;
        const userId = req.userId;
        // console.log("Received data:", req.body);

        // Validation: Ensure required fields are present
        if (!title || !author || rating === undefined) {
            return res.status(400).json({ message: 'Title, author, and rating are required' });
        }

        // Create and save the new book
        const newBook = new Book({ title, author, rating, about, image, userId });
        const savedBook = await newBook.save();

        // Send back the created book with a 201 status
        return res.status(201).json(savedBook);
    } catch (error) {
        // Send a 500 error if there's an issue with saving the book
        console.error("Error saving book:", error);
        return res.status(500).json({ message: 'Failed to add book', error: error.message });
    }
}
const getUserBooks = async (req, res) => {
  try {
      const userId = req.userId;
      // Fetch books for the user and sort them by creation date in descending order
      const books = await Book.find({ userId: userId }).sort({ createdAt: -1 }); // Sort by createdAt descending
      console.log("getuserbooks", books);
      res.json(books); // Send the sorted books to the client
  } catch (error) {
      console.log(req.user);
      res.status(500).json({ message: 'Failed to getUserBooks', error: error.message });
  }
};
const deleteBook = async(req,res)=>{
    try{
        const bookId = req.params.id;
        const deleteBook = await Book.findByIdAndDelete(bookId);
        if(!deleteBook) return res.status(404).json({message:'book not found'});
        res.json({message:'Book deleted sucessfully', book: deleteBook});
    }catch(error){
        res.status(500).json({message:'failed to deleteBook'});
    }
}


const updateBook = async(req,res)=>{
    try{
        const bookId = req.params.id;
        const { title, author, rating, about } = req.body;
        const updatedBook = await Book.findByIdAndUpdate(bookId, { title, author, rating, about}, { new: true });
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.json(updatedBook);
    }catch(error){
        // console.log("UpdateBook Ran");
        res.status(500).json({message:'failed to Updatye book'});
    }
}

// const updateReadingProgress = async (req, res) => {
//   try {
//     const { progress, comments } = req.body;
//     const bookId = req.params.id;
//     const userId = req.userId;

//     // Verify the book exists and belongs to the user
//     const book = await Book.findOne({ _id: bookId, userId });
//     if (!book) {
//       return res.status(404).json({ message: 'Book not found or not added by this user' });
//     }

//     // Check if a ReadingProgress entry exists for this user and book
//     let readingProgress = await ReadingProgress.findOne({ book: bookId, user: userId });

//     if (readingProgress) {
//       // Update existing progress
//       readingProgress.progress = progress;
//       readingProgress.comments = comments || readingProgress.comments;
//       readingProgress.createdAt = Date.now();
//     } else {
//       // Create new ReadingProgress
//       readingProgress = new ReadingProgress({
//         user: userId,
//         book: bookId,
//         progress,
//         comments,
//       });
//     }

//     // Update `currentlyReading` based on progress
//     if (progress === 100) {
//       book.currentlyReading = false; // Mark as not currently reading
//       book.status='finished';
//     } else {
//       book.currentlyReading = true; // Mark as currently reading
//       book.status="reading";
//     }

//     await book.save();
//     await readingProgress.save();

//     res.status(200).json({
//       message: 'Reading progress updated successfully',
//       readingProgress,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating reading progress', error: error.message });
//   }
// };
const updateReadingProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const bookId = req.params.id;
    const userId = req.userId;

    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      return res.status(404).json({ message: 'Book not found or not added by this user' });
    }

    let readingProgress = await ReadingProgress.findOne({ book: bookId, user: userId });
    if (readingProgress) {
      readingProgress.progress = progress;
    } else {
      readingProgress = new ReadingProgress({ user: userId, book: bookId, progress });
    }

    if (progress === 100) {
      book.currentlyReading = false;
      book.status = 'finished';
    } else {
      book.currentlyReading = true;
      book.status = 'reading';
    }

    await book.save();
    await readingProgress.save();

    res.status(200).json({
      book: bookId,
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reading progress', error: error.message });
  }
};

const getCurrentlyReadingBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const books = await Book.find({ currentlyReading: true, userId });
const progressData = await ReadingProgress.find({ user: userId, book: { $in: books.map(book => book._id) } });

const booksWithProgress = books.map(book => {
  const progress = progressData.find(progress => progress.book.equals(book._id));
  return {
    ...book.toObject(),
    progress: progress?.progress || 0,
    comments: progress?.comments || '',
  };
});

res.json(booksWithProgress);
    } catch (error) {
        res.status(500).json({ message: "Error fetching currently reading books", error: error.message });
    }
};

const getReadingProgress = async (req, res) => {
    try {
      const userId = req.userId;
      const  bookId = req.params.id;
  
      const readingProgress = await ReadingProgress.findOne({ book: bookId, user: userId }).populate('book');
      if (!readingProgress) {
        return res.status(404).json({ message: 'Reading progress not found for this book' });
      }
  
      res.status(200).json(readingProgress);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reading progress', error: error.message });
    }
  };

  const markBookAsFinished = async (req, res) => {
    try {
      const bookId = req.params.id;
      const userId = req.userId;
  
      // Verify the book exists and belongs to the user
      const book = await Book.findOne({ _id: bookId, userId });
      if (!book) {
        return res.status(404).json({ message: 'Book not found or not added by this user' });
      }
  
      // Mark the book as finished
      book.currentlyReading = false;
      book.status='finished';
      await book.save();
  
      res.status(200).json({
        message: 'Book status updated successfully',
        book,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error marking book as finished', error: error.message });
    }
  };
  
  const markBookAsCurrentlyReading = async (req, res) => {
    try {
      const bookId = req.params.id;
      const userId = req.userId;
  
      // Verify the book exists and belongs to the user
      const book = await Book.findOne({ _id: bookId, userId });
      if (!book) {
        return res.status(404).json({ message: 'Book not found or not added by this user' });
      }
  
      // Mark the book as currently reading
      book.currentlyReading = true;
      book.status='reading';
      await book.save();
  
      res.status(200).json({
        message: 'Book marked as currently reading successfully',
        book,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error marking book as currently reading', error: error.message });
    }
  };


  const getFinishedBooks = async (req, res) => {
    try {
      const userId = req.userId;
      const finishedBooks = await Book.find({ userId, status: 'finished' })
      .populate('userId','username')
      .populate({
        path: 'reviews',
        model: 'Review'
      });
  
      if (!finishedBooks) {
        return res.status(404).json({ message: 'No finished books found' });
      }
  
      res.status(200).json(finishedBooks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching finished books', error: error.message });
    }
  };
  
const getFriendsBooks = async (req, res) => {
    try {
        const userId = req.userId;

        // Find friends' user IDs
        const friendships = await Friendship.find({
            $or: [{ user: userId }, { friend: userId }],
            status: 'accepted',
        });
        console.log('friendsUswerBooks', friendships);

        const friendUserIds = friendships.map(f => 
            f.user.toString() === userId ? f.friend : f.user
        );
        console.log('friendsUswerBooksIds', friendUserIds);

        // Find books that belong to friends
        const friendsBooks = await Book.find({ userId: { $in: friendUserIds } })
            .populate('userId')
            .exec();
            console.log('friendsBooks', friendsBooks);
        res.status(200).json(friendsBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends books', error: error.message });
    }
};



const addFriendBookToUser = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.userId;

        // Validate and convert bookId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }

        // Fetch the book by ID
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Create a new book document for the user, keeping the original author
        const newBook = new Book({
            title: book.title,
            author: book.author,
            rating: book.rating,
            about: book.about,
            image: book.image,
            userId: userId,
            isFriendBook: true,
        });

        const savedBook = await newBook.save();

        return res.status(201).json(savedBook);
    } catch (error) {
        console.error('Error adding friend\'s book to user:', error);
        return res.status(500).json({ message: 'Failed to add friend\'s book to user', error: error.message });
    }
};
const markAsFavorite = async (req, res) => {
  try {
      const { bookId } = req.params;
      const userId = req.userId;

      // Find the book and update the `isFavorite` field
      const book = await Book.findOneAndUpdate(
          { _id: bookId, userId: userId },
          { $set: { isFavorite: true } },
          { new: true }
      );

      if (!book) {
          return res.status(404).json({ message: "Book not found or not owned by user" });
      }

      res.status(200).json({ message: "Book marked as favorite", book });
  } catch (error) {
      console.error("Error marking book as favorite:", error);
      res.status(500).json({ message: "Error marking book as favorite", error: error.message });
  }
};

const getFavoriteBooks = async (req, res) => {
  try {
      const userId = req.userId;

      // Find all books marked as favorite for the user
      const favoriteBooks = await Book.find({ userId: userId, isFavorite: true }).sort({ createdAt: -1 })
         

          console.log("favoriteBooks",favoriteBooks);

      res.json(favoriteBooks);
  } catch (error) {
      console.error("Error fetching favorite books:", error);
      res.status(500).json({ message: "Error fetching favorite books", error: error.message });
  }
};








module.exports={
    getBestSellers,
    getBookDetails,
    searchBooks,
    searchUserBooks,
    addBook,
    getUserBooks,
    deleteBook,
    updateBook,
    updateReadingProgress,
    getCurrentlyReadingBooks,
    getReadingProgress,
    markBookAsCurrentlyReading,
    markBookAsFinished,
    getFinishedBooks,
    searchUserAndFriendsBooks,
    searchPeople,
    getFriendsBooks,
    addFriendBookToUser,
    markAsFavorite,
    getFavoriteBooks    
};