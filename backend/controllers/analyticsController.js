const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Review } = require('../models/models');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalOrders, monthOrders, lastMonthOrders,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalUsers, monthUsers,
      totalProducts, lowStockProducts,
      pendingOrders, deliveredOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$pricing.total' } } }]),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ 'stock.status': 'low_stock', isActive: true }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
    ]);

    // Monthly revenue chart (last 6 months)
    const revenueChart = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top selling products
    const topProducts = await Product.find({ isActive: true })
      .select('name brand images salesCount price ratings')
      .sort({ salesCount: -1 })
      .limit(5);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Revenue by brand
    const revenueByBrand = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.brand',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]);

    const calcGrowth = (current, previous) =>
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : 100;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          monthOrders,
          ordersGrowth: calcGrowth(monthOrders, lastMonthOrders),
          totalRevenue: totalRevenue[0]?.total || 0,
          monthRevenue: monthRevenue[0]?.total || 0,
          revenueGrowth: calcGrowth(monthRevenue[0]?.total || 0, lastMonthRevenue[0]?.total || 0),
          totalUsers,
          monthUsers,
          totalProducts,
          lowStockProducts,
          pendingOrders,
          deliveredOrders,
        },
        recentOrders,
        revenueChart,
        topProducts,
        ordersByStatus,
        revenueByBrand,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$pricing.total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data: dailySales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
