const express = require("express");
const router = express.Router();
const bookController =require("../controllers/bookController");

router.get('/',(req,res)=>{
    res.json({message: 'welcome to books api'});
})
//hardcover-fiction

router.get('/best-sellers',bookController.getBestSellers);
router.get('/book-details/:isbn',bookController.getBookDetails);
router.get('/search/:query', bookController.searchBooks);

//routes for database operations
router.post('/add', bookController.addBook);
router.get('/user-books', bookController.getUserBooks);
router.delete('/:id',bookController.deleteBook);
router.put('/:id',bookController.updateBook);

module.exports = router;