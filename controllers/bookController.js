const api = require("../middleware/api");
const Book = require("../models/Book");
const ReadingProgress = require("../models/ReadingProgress");


const getBestSellers = async(req,res)=>{
    const list= req.params.list;
    try{
        const data = await api.getBestSellers(list);
        res.json(data);
    }catch(error){
        res.status(500).json({message:'error fetching best sellers',error:error.message});
    }
}

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
const addBook = async (req, res) => {
    try {
        const { title, author, rating, about} = req.body;
        const userId = req.userId;
        // console.log("Received data:", req.body);

        // Validation: Ensure required fields are present
        if (!title || !author || rating === undefined) {
            return res.status(400).json({ message: 'Title, author, and rating are required' });
        }

        // Create and save the new book
        const newBook = new Book({ title, author, rating, about, userId });
        const savedBook = await newBook.save();

        // Send back the created book with a 201 status
        return res.status(201).json(savedBook);
    } catch (error) {
        // Send a 500 error if there's an issue with saving the book
        console.error("Error saving book:", error);
        return res.status(500).json({ message: 'Failed to add book', error: error.message });
    }
}

const getUserBooks = async(req,res)=>{
    try{
        const userId = req.userId;
        // console.log("userIdgetBooks", userId);
        //console.log("getUserBooks",req.userId);
        const books = await Book.find({userId: userId});
        console.log("getuserbooks",books);
        res.json(books);
    }catch(error){
        console.log(req.user);
        res.status(500).json({message:'failed to getUserBooks',error:error.message});
    }
}

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

const updateReadingProgress = async (req, res) => {
  try {
    const { progress, comments } = req.body;
    const bookId = req.params.id;
    const userId = req.userId;

    // Verify the book exists and belongs to the user
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      return res.status(404).json({ message: 'Book not found or not added by this user' });
    }

    // Check if a ReadingProgress entry exists for this user and book
    let readingProgress = await ReadingProgress.findOne({ book: bookId, user: userId });

    if (readingProgress) {
      // Update existing progress
      readingProgress.progress = progress;
      readingProgress.comments = comments || readingProgress.comments;
      readingProgress.createdAt = Date.now();
    } else {
      // Create new ReadingProgress
      readingProgress = new ReadingProgress({
        user: userId,
        book: bookId,
        progress,
        comments,
      });
    }

    // Update `currentlyReading` based on progress
    if (progress === 100) {
      book.currentlyReading = false; // Mark as not currently reading
    } else {
      book.currentlyReading = true; // Mark as currently reading
    }

    await book.save();
    await readingProgress.save();

    res.status(200).json({
      message: 'Reading progress updated successfully',
      readingProgress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reading progress', error: error.message });
  }
};
const getCurrentlyReadingBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const books = await Book.find({ userId, currentlyReading: true });
        res.status(200).json(books);
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



module.exports={
    getBestSellers,
    getBookDetails,
    searchBooks,
    addBook,
    getUserBooks,
    deleteBook,
    updateBook,
    updateReadingProgress,
    getCurrentlyReadingBooks,
    getReadingProgress
};