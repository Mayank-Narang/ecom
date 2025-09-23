const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;
    
    // Update product's average rating and review count
    await Product.findByIdAndUpdate(req.params.productId, {
      averageRating,
      reviewCount: reviews.length
    });
    
    res.json({ 
      success: true,
      data: {
        reviews,
        averageRating,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Add a new review
router.post('/', async (req, res) => {
  try {
    const { productId, userName, rating, comment } = req.body;
    
    // Validate input
    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }
    
    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Analyze sentiment
    const sentimentResult = sentiment.analyze(comment);
    let analysis = 'neutral';
    if (sentimentResult.score > 2) analysis = 'positive';
    else if (sentimentResult.score < -2) analysis = 'negative';
    
    // Create review
    const review = new Review({
      productId,
      userName: userName.trim(),
      rating: parseInt(rating),
      comment,
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        analysis
      }
    });
    
    const savedReview = await review.save();
    
    // Update product's average rating and review count
    await updateProductRating(productId);
    
    // Fetch the updated product to get the latest review stats
    const updatedProduct = await Product.findById(productId);
    
    res.status(201).json({
      success: true,
      data: {
        review: savedReview,
        averageRating: updatedProduct.averageRating || 0,
        reviewCount: updatedProduct.reviewCount || 0
      }
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Helper function to update product's average rating and review count
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 0;
    
    await Product.findByIdAndUpdate(productId, { 
      $set: { 
        averageRating,
        reviewCount: reviews.length,
        rating: averageRating // For backward compatibility
      } 
    });
    
    return { averageRating, reviewCount: reviews.length };
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
}

module.exports = router;
