const mongoose = require('mongoose');
require('dotenv').config();

async function checkProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ecom',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get the Product model
    const Product = require('./src/models/Product');
    
    // Find all products
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products`);
    
    if (products.length > 0) {
      console.log('\nSample product:');
      console.log(JSON.stringify(products[0].toObject(), null, 2));
      
      // Validate each product against the schema
      console.log('\nValidating products...');
      for (const product of products) {
        try {
          await product.validate();
        } catch (err) {
          console.error('\n❌ Validation error for product:', product._id);
          console.error(err.message);
          console.log('Please fix the product manually');
        }
      }
      console.log('✅ All products validated');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProducts();
