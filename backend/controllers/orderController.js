const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Coupon, Notification } = require('../models/models');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, payment, couponCode, notes, isGift, giftMessage } = req.body;

    // Validate products and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }
      if (product.stock.status === 'out_of_stock') {
        return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
      }
      const price = product.price.discounted || product.price.original;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        image: product.images[0]?.url,
        price,
        quantity: item.quantity,
        sku: product.sku,
      });
    }

    // Coupon validation
    let couponDiscount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= coupon.validUntil && subtotal >= coupon.minOrderAmount) {
        if (coupon.type === 'percentage') {
          couponDiscount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity);
        } else if (coupon.type === 'fixed') {
          couponDiscount = coupon.value;
        }
        coupon.usageCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
        appliedCoupon = { code: coupon.code, discount: couponDiscount };
      }
    }

    const shipping = subtotal > 50000 ? 0 : 499;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax - couponDiscount;
    const loyaltyPointsEarned = Math.floor(total / 100); // 1 point per ₹100

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, shipping, tax, discount: couponDiscount, total },
      coupon: appliedCoupon,
      payment: { method: payment.method, status: payment.method === 'cod' ? 'pending' : 'pending' },
      status: 'pending',
      timeline: [{ status: 'pending', message: 'Order placed successfully' }],
      notes: { customer: notes },
      isGift, giftMessage,
      loyaltyPointsEarned,
    });

    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'stock.quantity': -item.quantity, salesCount: item.quantity },
      });
    }

    // Clear cart
    await User.findByIdAndUpdate(req.user._id, { cart: [], $inc: { totalOrders: 1, totalSpent: total, loyaltyPoints: loyaltyPointsEarned } });

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: 'order',
      title: 'Order Placed Successfully!',
      message: `Your order #${order.orderNumber} has been placed. Total: ₹${total.toLocaleString('en-IN')}`,
      link: `/orders/${order._id}`,
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', message: req.body.reason || 'Cancelled by customer', updatedBy: req.user._id });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { 'stock.quantity': item.quantity } });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentStatus) query['payment.status'] = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    order.timeline.push({ status, message: message || `Order ${status}`, updatedBy: req.user._id });

    if (status === 'shipped') {
      order.shipping.trackingNumber = trackingNumber;
      order.shipping.carrier = carrier;
      order.shipping.shippedAt = new Date();
    }
    if (status === 'delivered') {
      order.shipping.deliveredAt = new Date();
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    await order.save();

    await Notification.create({
      user: order.user,
      type: 'order',
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your order #${order.orderNumber} has been ${status}.`,
      link: `/orders/${order._id}`,
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
