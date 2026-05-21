const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, ctrl.createOrder);
router.get('/my', protect, ctrl.getUserOrders);
router.get('/admin/all', protect, authorize('admin'), ctrl.getAllOrders);
router.get('/:id', protect, ctrl.getOrder);
router.post('/:id/cancel', protect, ctrl.cancelOrder);
router.put('/:id/status', protect, authorize('admin'), ctrl.updateOrderStatus);

module.exports = router;
