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

 router.get('/search/books/:query',bookController.searchUserAndFriendsBooks);
//router.get('/search/books/:query',bookController.searchUserBooks);
router.get('/search/people/:query', bookController.searchPeople)

//routes for database operations
router.post('/add', bookController.addBook);
router.get('/user-books', bookController.getUserBooks);
router.delete('/:id',bookController.deleteBook);
router.put('/:id',bookController.updateBook);
router.get('/currently-reading', bookController.getCurrentlyReadingBooks);
router.get('/progress/:id', bookController.getReadingProgress);
router.put('/progress/:id', bookController.updateReadingProgress);
router.put('/finish/:id', bookController.markBookAsFinished);
router.put('/mark-as-reading/:id', bookController.markBookAsCurrentlyReading);
router.get('/finished', bookController.getFinishedBooks);
router.get('/friends-books',bookController.getFriendsBooks);
router.post('/friends-books/:bookId/add',bookController.addFriendBookToUser);
router.put('/:bookId/favorite', bookController.markAsFavorite);
router.get('/favorites', bookController.getFavoriteBooks);

module.exports = router;