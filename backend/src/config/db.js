const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Close existing connection if any
    if (mongoose.connection.readyState === 1) {
      console.log('Closing existing MongoDB connection...');
      await mongoose.disconnect();
    }

    // Set strict query mode
    mongoose.set('strictQuery', true);

    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI);

    // Connect with retry logic
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        console.log(`Connection attempt ${4 - retries}/3...`);
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
          dbName: 'ecom',
          serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
          socketTimeoutMS: 45000,
          retryWrites: true,
          w: 'majority'
        });
        
        console.log('MongoDB Connected to:', conn.connection.host);
        return; // Successfully connected
      } catch (err) {
        lastError = err;
        retries--;
        console.error(`MongoDB connection error (${retries} retries left):`, {
          message: err.message,
          name: err.name,
          code: err.code,
          codeName: err.codeName,
          errorLabels: err.errorLabels,
          stack: err.stack
        });
        
        if (retries === 0) {
          console.error('All connection attempts failed. Last error:', lastError);
          throw lastError;
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
      }
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB after retries:', err);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
