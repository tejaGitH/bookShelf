const Review = require('../models/Review');
const Book = require('../models/Book')

//**POST**Add a review
exports.addReview = async(req,res)=>{
    const {bookId} = req.params;
    const {rating, review} = req.body;

    try{
        const newReview = new Review({
            book: bookId,
            user: req.userId,
            rating,
            review
        });
        await newReview.save();

        //Add the review to the books review array
        const book = await Book.findById(bookId);
        book.reviews.push(newReview._id);
        await book.save();

        return res.status(201).json({message:'Review added successfully'});
        console.log("review added");
    }catch(error){
        console.error('Error adding review:', error);
        return res.status(500).json({message:'Error adding review', error});
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