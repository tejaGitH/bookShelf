const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewContoller');

router.post('/:bookId/reviews', reviewController.addReview);
router.get('/:bookId/reviews', reviewController.getReviewsForBook);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId',reviewController.deleteReview);

module.exports = router;
