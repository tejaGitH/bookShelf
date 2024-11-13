const api = require("../middleware/api");
const Book = require("../models/Book");


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

const addBook = async(req,res)=>{
    try{
        const {title, author, rating} = req.body;
        console.log(req.body);
        const newBook = new Book({title,author,rating});
        const savedBook = await newBook.save();
        res.json(savedBook);
    }catch(error){
        res.status(500).json({message:'Failed to addbook', error :error.message})
    }
}

const getUserBooks = async(req,res)=>{
    try{
        const userId = req.userId;
        console.log("getUserBooks",req.userId);
        const books = await Book.find({userId: userId});
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
        const { title, author, rating } = req.body;
        const updatedBook = await Book.findByIdAndUpdate(bookId, { title, author, rating }, { new: true });
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.json(updatedBook);
    }catch(error){
        res.status(500).json({message:'failed to Updatye book'});
    }
}



module.exports={
    getBestSellers,
    getBookDetails,
    searchBooks,
    addBook,
    getUserBooks,
    deleteBook,
    updateBook
};