const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a review
router.post('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, userName, rating, comment } = req.body;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId,
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }
    
    // Create review
    const review = new Review({
      productId,
      userId,
      userName,
      rating,
      comment,
    });
    
    await review.save();
    
    // Update product's ratings
    product.ratings.push({ userId, rating });
    await product.save();
    
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
});

// Update a review
router.put('/:reviewId', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    
    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, userId },
      { rating, comment },
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or you are not authorized to update it' 
      });
    }
    
    res.json({ success: true, data: review });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ success: false, message: 'Error updating review' });
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId,
    });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or you are not authorized to delete it' 
      });
    }
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
});

// Like/Unlike a review
router.post('/:reviewId/like', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check if user already liked the review
    const likeIndex = review.likes.indexOf(userId);
    let message = '';
    
    if (likeIndex === -1) {
      // Add like
      review.likes.push(userId);
      message = 'Review liked successfully';
    } else {
      // Remove like
      review.likes.splice(likeIndex, 1);
      message = 'Review unliked successfully';
    }
    
    await review.save();
    
    res.json({ 
      success: true, 
      message,
      data: { likes: review.likes, likesCount: review.likes.length }
    });
  } catch (err) {
    console.error('Error toggling like on review:', err);
    res.status(500).json({ success: false, message: 'Error toggling like on review' });
  }
});

module.exports = router;
