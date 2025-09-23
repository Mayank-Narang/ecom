const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  sentiment: {
    score: Number,
    comparative: Number,
    analysis: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
  }
}, { 
  timestamps: true,
  // Ensure the compound index is created with the correct options
  autoIndex: true
});

// Remove all existing indexes and create a fresh one
reviewSchema.pre('save', async function(next) {
  try {
    const collection = this.constructor.collection;
    
    // Drop all existing indexes except _id_
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (err) {
          if (err.codeName !== 'NamespaceNotFound') {
            console.error(`Error dropping index ${index.name}:`, err.message);
          }
        }
      }
    }
    
    next();
  } catch (err) {
    console.error('Error in pre-save hook:', err);
    next(err);
  }
});

// Create the model first
const Review = mongoose.model('Review', reviewSchema);

// Then create the indexes with the correct options
async function createReviewIndexes() {
  try {
    // Drop all existing indexes first
    const collection = Review.collection;
    const indexes = await collection.indexes();
    
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (err) {
          console.error(`Error dropping index ${index.name}:`, err.message);
        }
      }
    }

    // Create the compound index for one review per user per product
    await Review.collection.createIndex(
      { productId: 1, userName: 1 },
      {
        name: 'one_review_per_user_per_product',
        unique: true,
        background: true,
        partialFilterExpression: { userName: { $exists: true } }
      }
    );
    
    // Create text index for searching comments
    await Review.collection.createIndex(
      { comment: 'text' },
      { name: 'comment_text', background: true }
    );
    
    console.log('Created all indexes successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Run index creation when the model is loaded
createReviewIndexes().catch(console.error);

module.exports = Review;
