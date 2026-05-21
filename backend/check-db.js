const mongoose = require('mongoose');
require('dotenv').config();

const check = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/laptopstore';
    await mongoose.connect(uri);
    console.log('Connected successfully');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check Category count
    const Category = mongoose.connection.db.collection('categories');
    const categories = await Category.find().toArray();
    console.log('Categories count:', categories.length);
    console.log('Categories:', categories.map(c => ({ id: c._id, name: c.name, isActive: c.isActive })));
    
    // Check Coupon count
    const Coupon = mongoose.connection.db.collection('coupons');
    const coupons = await Coupon.find().toArray();
    console.log('Coupons count:', coupons.length);
    console.log('Coupons:', coupons);
    
    // Check Products count
    const Product = mongoose.connection.db.collection('products');
    const products = await Product.find().toArray();
    console.log('Products count:', products.length);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

check();
