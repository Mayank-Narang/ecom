const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Close existing connection if any
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    // Set strict query mode
    mongoose.set('strictQuery', true);

    // Connect with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          dbName: 'ecom',
          serverSelectionTimeoutMS: 5000, // 5 seconds timeout
          socketTimeoutMS: 45000, // 45 seconds timeout
        });
        console.log('MongoDB Connected...');
        return; // Successfully connected
      } catch (err) {
        retries--;
        console.error(`MongoDB connection error (${retries} retries left):`, err.message);
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
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
