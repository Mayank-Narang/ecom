const mongoose = require('mongoose');
require('dotenv').config();

async function checkProduct() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ecom',
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');

    const Product = require('./src/models/Product');
    
    // Check if the product exists
    const product = await Product.findById('68d03b7e50195de45bab74ee').lean();
    console.log('Product from DB:', JSON.stringify(product, null, 2));
    
    // Check all products
    const products = await Product.find({}).lean();
    console.log('All products:', products.map(p => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      category: p.category
    })));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProduct();
