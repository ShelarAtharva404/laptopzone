const express = require('express');
const router = express.Router();
const analyticsCtrl = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', analyticsCtrl.getDashboardStats);
router.get('/sales', analyticsCtrl.getSalesAnalytics);

module.exports = router;
