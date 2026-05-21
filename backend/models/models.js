const mongoose = require('mongoose');

// ─── Category Model ───────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  image: String,
  icon: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// ─── Review Model ────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  pros: [String],
  cons: [String],
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  unhelpfulVotes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: true },
  adminReply: {
    text: String,
    repliedAt: Date,
  },
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

// Update product ratings after review save
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product } },
    {
      $group: {
        _id: '$product',
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
        five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].avg * 10) / 10,
      'ratings.count': stats[0].count,
      'ratings.distribution': {
        five: stats[0].five, four: stats[0].four, three: stats[0].three,
        two: stats[0].two, one: stats[0].one,
      },
    });
  }
});

// ─── Coupon Model ────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  isActive: { type: Boolean, default: true },
  isFirstOrderOnly: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Notification Model ──────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGlobal: { type: Boolean, default: false },
  type: { type: String, enum: ['order', 'payment', 'product', 'promo', 'system', 'review'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  isRead: { type: Boolean, default: false },
  icon: String,
}, { timestamps: true });

module.exports = {
  Category: mongoose.model('Category', categorySchema),
  Review: mongoose.model('Review', reviewSchema),
  Coupon: mongoose.model('Coupon', couponSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
