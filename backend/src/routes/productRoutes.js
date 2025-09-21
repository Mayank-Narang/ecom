const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// List all product IDs
router.get('/ids', async (req, res) => {
  try {
    const products = await Product.find({}, '_id').lean();
    res.json(products.map(p => p._id.toString()));
  } catch (err) {
    console.error('Error fetching product IDs:', err);
    res.status(500).json({ success: false, message: 'Error fetching product IDs' });
  }
});

// Test MongoDB connection
router.get('/test', async (req, res) => {
  try {
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Try to get a count of documents in each collection
    const collectionStats = {};
    for (const name of collectionNames) {
      try {
        const count = await mongoose.connection.db.collection(name).countDocuments();
        collectionStats[name] = { count };
      } catch (err) {
        collectionStats[name] = { error: err.message };
      }
    }
    
    res.json({
      success: true,
      database: mongoose.connection.db.databaseName,
      collections: collectionNames,
      stats: collectionStats,
      status: 'MongoDB connection is working'
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to connect to MongoDB'
    });
  }
});

// Get all products with search and filter
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    
    // Filter by category if provided
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Search by name or description if search term is provided
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { category: { $regex: searchRegex } }
      ];
    }
    
    console.log('Fetching products with query:', query);
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching product with ID: ${req.params.id}`);
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found',
        error: `No product found with ID: ${req.params.id}`
      });
    }
    
    // Ensure consistent data structure
    const formattedProduct = {
      ...product,
      id: product._id.toString(),
      _id: product._id.toString(),
      rating: product.averageRating || 0,
      ratings: product.ratings || []
    };
    
    console.log('Returning product:', formattedProduct);
    res.json({ 
      success: true, 
      data: formattedProduct 
    });
    
  } catch (err) {
    console.error('Error fetching product:', {
      error: err.message,
      stack: err.stack,
      productId: req.params.id
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching product details',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Create product (Admin only)
router.post('/', async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    
    // Basic validation
    const { name, price, description, imageURL, category } = req.body;
    
    if (!name || !description || !imageURL || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, imageURL, and category are required',
        missingFields: [
          !name ? 'name' : null,
          !description ? 'description' : null,
          !imageURL ? 'imageURL' : null,
          !category ? 'category' : null
        ].filter(Boolean)
      });
    }
    
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0',
        received: price
      });
    }
    
    // Create the product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      imageURL: imageURL.trim(),
      category: category.trim()
    });
    
    // Save to database
    const savedProduct = await product.save();
    
    console.log('Product created successfully:', savedProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A product with this name already exists',
        error: error.message
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update product (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
});

// Delete product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    try {
      // Delete all reviews associated with this product
      await Review.deleteMany({ productId: req.params.id });
    } catch (reviewError) {
      console.error('Error deleting product reviews:', reviewError);
      // Continue even if reviews deletion fails
    }
    
    res.json({ 
      success: true, 
      message: 'Product deleted successfully',
      data: { id: req.params.id }
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    const statusCode = err.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      message: err.message || 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
