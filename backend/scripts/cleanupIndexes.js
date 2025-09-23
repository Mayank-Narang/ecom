const mongoose = require('mongoose');
const Review = require('../src/models/Review');
require('dotenv').config();

async function cleanupIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get the Review collection
    const collection = mongoose.connection.db.collection('reviews');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Find and drop problematic indexes
    const indexesToDrop = [
      'product_1_user_1',
      'product_1_userName_1',
      'product_1_userName_1_text_comment_text'
    ];

    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`Dropped index: ${indexName}`);
      } catch (err) {
        if (err.codeName !== 'NamespaceNotFound') {
          console.error(`Error dropping index ${indexName}:`, err.message);
        }
      }
    }

    // Create the correct index
    await Review.init();
    console.log('Created new indexes');

    // Verify the indexes
    const newIndexes = await collection.indexes();
    console.log('Updated indexes:', JSON.stringify(newIndexes, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up indexes:', error);
    process.exit(1);
  }
}

cleanupIndexes();
