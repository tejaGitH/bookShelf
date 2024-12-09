const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewContoller');

router.post('/:bookId/reviews', reviewController.addReview);
router.get('/:bookId/reviews', reviewController.getReviewsForBook);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId',reviewController.deleteReview);
router.post('/:reviewId/like', reviewController.likeReview);
router.post('/:reviewId/comments', reviewController.addComment);

module.exports = router;
