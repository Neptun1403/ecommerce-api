const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Any logged in user can create and view their own orders
router.post('/', authMiddleware, orderController.createOrder);
router.get('/my', authMiddleware, orderController.getMyOrders);

// Admin only
router.get('/all', authMiddleware, roleMiddleware(['admin']), orderController.getAllOrders);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), orderController.updateOrderStatus);

module.exports = router;