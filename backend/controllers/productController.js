const Product = require('../models/Product');
const { Category } = require('../models/models');

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filters
    if (req.query.brand) {
      query.brand = { $in: req.query.brand.split(',') };
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query['price.discounted'] = {};
      if (req.query.minPrice) query['price.discounted'].$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query['price.discounted'].$lte = Number(req.query.maxPrice);
    }
    if (req.query.minRating) {
      query['ratings.average'] = { $gte: Number(req.query.minRating) };
    }
    if (req.query.inStock === 'true') {
      query['stock.status'] = { $ne: 'out_of_stock' };
    }
    if (req.query.isFeatured === 'true') query.isFeatured = true;
    if (req.query.isNew === 'true') query.isNew = true;
    if (req.query.isBestSeller === 'true') query.isBestSeller = true;

    // RAM filter
    if (req.query.ram) {
      query['specifications.ram.size'] = { $in: req.query.ram.split(',').map(Number) };
    }
    // Storage filter
    if (req.query.storage) {
      query['specifications.storage'] = { $elemMatch: { capacity: { $in: req.query.storage.split(',').map(Number) } } };
    }
    // GPU filter
    if (req.query.gpu) {
      query['specifications.graphics.brand'] = { $in: req.query.gpu.split(',') };
    }
    // Display size filter
    if (req.query.displaySize) {
      query['specifications.display.size'] = { $in: req.query.displaySize.split(',').map(Number) };
    }

    // Sorting
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':    sort = { 'price.discounted': 1 }; break;
      case 'price_desc':   sort = { 'price.discounted': -1 }; break;
      case 'rating':       sort = { 'ratings.average': -1 }; break;
      case 'newest':       sort = { createdAt: -1 }; break;
      case 'popular':      sort = { salesCount: -1 }; break;
      case 'discount':     sort = { 'discount.percentage': -1 }; break;
      default:             sort = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name brand slug images price discount stock ratings salesCount isFeatured isNew isBestSeller specifications.display.size specifications.ram.size specifications.processor.model')
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug, isActive: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category', 'name slug').populate('relatedProducts', 'name images price brand ratings slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .select('name brand slug images price discount ratings isFeatured isNew isBestSeller')
      .limit(8);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name brand slug images price discount ratings salesCount')
      .sort({ salesCount: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNew: true, isActive: true })
      .select('name brand slug images price discount ratings createdAt')
      .sort({ createdAt: -1 })
      .limit(8);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN ONLY
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) query.$text = { $search: req.query.search };
    if (req.query.brand) query.brand = req.query.brand;
    if (req.query.status) query.isActive = req.query.status === 'active';

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 'stock.quantity': quantity },
      { new: true }
    );
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
