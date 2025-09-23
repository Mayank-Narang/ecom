const mongoose = require('mongoose');
require('dotenv').config();

async function removeDuplicateIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('reviews');
    
    // Drop the duplicate index
    try {
      await collection.dropIndex('productId_1_userName_1');
      console.log('Dropped duplicate index: productId_1_userName_1');
    } catch (err) {
      if (err.codeName !== 'NamespaceNotFound') {
        console.error('Error dropping index:', err.message);
      }
    }
    
    // Verify the remaining indexes
    const indexes = await collection.indexes();
    console.log('Remaining indexes:', JSON.stringify(indexes.map(idx => ({
      name: idx.name,
      key: idx.key,
      unique: !!idx.unique
    })), null, 2);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeDuplicateIndexes();
