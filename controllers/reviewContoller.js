const Review = require('../models/Review');
const Book = require('../models/Book');
const Friendship = require('../models/Friendship');
const User = require('../models/User');

//**POST**Add a review
// exports.addReviewBook = async(req,res)=>{
//     const {bookId} = req.params;
//     const {rating, review} = req.body;

//     try{
//         const newReview = new Review({
//             book: bookId,
//             user: req.userId,
//             rating,
//             review
//         });
//         await newReview.save();

//         //Add the review to the books review array
//         const book = await Book.findById(bookId);
//         book.reviews.push(newReview._id);
//         await book.save();

//         return res.status(201).json({message:'Review added successfully'});
//         console.log("review added");
//     }catch(error){
//         console.error('Error adding review:', error);
//         return res.status(500).json({message:'Error adding review', error});
//     }
// };


// Add a review

exports.addReview = async (req, res) => {
    const { bookId } = req.params;
    const { rating, review } = req.body;

    try {
        const newReview = new Review({
            book: bookId,
            user: req.userId,
            rating,
            review
        });
        await newReview.save();

        const book = await Book.findById(bookId);
        book.reviews.push(newReview._id);
        await book.save();

        const friendships = await Friendship.find({
            $or: [{ user: req.userId }, { friend: req.userId }],
            status: "accepted"
        }).populate("user friend");

        const friendIds = friendships.map(f => {
            return f.user._id.toString() === req.userId ? f.friend._id.toString() : f.user._id.toString();
        }).filter(Boolean);

        const updates = await Review.find({ user: { $in: friendIds.concat(req.userId) } })
            .populate("user", "username")
            .populate({
                path: 'book',
                select: 'title author' // Ensure 'author' is populated
            });

        res.status(201).json({
            message: 'Review added successfully',
            review: newReview,
            updates
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review', error });
    }
};


//**GET** get all reviews
exports.getReviewsForBook = async(req,res)=>{
    const {bookId} = req.params;
    try{
        const reviews = await Review.find({book: bookId}).populate('user', 'username');
        return res.status(200).json(reviews);
    }catch(error){
        console.error('error fetching reviews');
        return res.status(500).json({message:'error fetchiong reviews',error});
    }
}

//**PUT** Update a review
exports.updateReview = async(req,res)=>{
    const {reviewId} = req.params;
    const{rating, review} = req.body;
    try{
        const existingReview = await Review.findById(reviewId);

        if(!existingReview){
            return res.status(404).json({message:'Review not found'});
        }
        if(existingReview.user.toString() !== req.userId){
            return res.status(403).json({message:'unauthorized acces to update review'});
        }
        existingReview.rating = rating;
        existingReview.review = review;
        await existingReview.save();

        return res.status(200).json({message:'Review updated sucessfully'});
    }catch(error){
        console.error('error updating reviews',error);
        return res.status(500).json({message:'error updating reviews',error});
    }
}

//**DELETE** delete a review
exports.deleteReview = async(req,res)=>{
    const{ reviewId} = req.params;
    try{
        const review = await Review.findById(reviewId);
        
        if(!review){
            return res.status(404).json({message:'Review not found'});
        }
        if(review.user.toString() !== req.userId){
            return res.status(403).json({message:'unauthorized acces to delete review'});
        }

        await Review.findByIdAndDelete(reviewId);
        return res.status(200).json({message: 'Review deleted successfully'});

    }catch(error){
        console.error('error deleting reviews');
        return res.status(500).json({message:'error deleting reviews',error});
    }
}



exports.likeReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.userId;
  
      // Find the review
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Handle "like" or "dislike" based on the query parameter
      const action = req.query.action; // Can be "like" or "dislike"
  
      if (action === 'dislike') {
        // If user already disliked, remove the dislike
        if (review.dislikes.includes(userId)) {
          review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);
        } else {
          // If the user liked the review before, remove the like
          review.likes = review.likes.filter((id) => id.toString() !== userId);
          // Add the user to dislikes
          review.dislikes.push(userId);
        }
      } else {
        // Default action: Like the review
        if (review.likes.includes(userId)) {
          // If user already liked, remove the like
          review.likes = review.likes.filter((id) => id.toString() !== userId);
        } else {
          // If the user disliked the review before, remove the dislike
          review.dislikes = review.dislikes.filter((id) => id.toString() !== userId);
          // Add the user to likes
          review.likes.push(userId);
        }
      }
  
      // Save the review with the updated likes/dislikes
      await review.save();
      res.status(200).json(review);
    } catch (error) {
      res.status(500).json({ message: 'Failed to like/dislike review', error: error.message });
    }
  };
  exports.addComment = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.userId;
        const { comment } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const newComment = { user: userId, comment };
        review.comments.push(newComment);
        await review.save();

        // Populate the user field in the newly added comment
        const populatedComment = await Review.findById(reviewId)
            .select("comments")
            .populate({
                path: "comments.user",
                select: "username",
                match: { _id: userId }, // Only populate the current user for the new comment
            });

        const latestComment = populatedComment.comments.pop();

        res.status(201).json({ reviewId, comment: latestComment });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
};









// Add a review
exports.addReview = async (req, res) => {
    const { bookId } = req.params;
    const { rating, review } = req.body;

    try {
        const newReview = new Review({
            book: bookId,
            user: req.userId,
            rating,
            review
        });
        await newReview.save();

        // Add the review to the book's review array
        const book = await Book.findByIdAndUpdate(bookId, { $push: { reviews: newReview._id } });

        // Trigger an update in social updates
        const friendships = await Friendship.find({
            $or: [{ user: req.userId }, { friend: req.userId }],
            status: "accepted"
        }).populate("user friend");

        const friendIds = friendships.map(f => {
            if (!f.user || !f.friend) {
                return null;
            }
            return f.user._id.toString() === req.userId ? f.friend._id.toString() : f.user._id.toString();
        }).filter(Boolean);

        const updates = await Review.find({ user: { $in: friendIds } })
            .populate("user", "username")
            .populate("book", "title");

        console.log("Updates found:", updates);

        return res.status(201).json({
            message: 'Review added successfully',
            review: newReview,
            updates
        });
    } catch (error) {
        console.error('Error adding review:', error);
        return res.status(500).json({ message: 'Error adding review', error });
    }
};
