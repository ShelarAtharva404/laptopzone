const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  brand: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  sku: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    phone: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  coupon: {
    code: String,
    discount: Number,
  },
  payment: {
    method: { type: String, enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date,
    gateway: String,
    stripePaymentIntentId: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending',
    index: true,
  },
  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  shipping: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,
  },
  notes: {
    customer: String,
    admin: String,
  },
  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: String,
    requestedAt: Date,
    approved: Boolean,
    approvedAt: Date,
  },
  isGift: { type: Boolean, default: false },
  giftMessage: String,
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.orderNumber = `LZ${year}${month}${random}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
