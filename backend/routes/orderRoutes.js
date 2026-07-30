const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getOrders);
router.route('/create-razorpay-order').post(protect, createRazorpayOrder);
router.route('/verify-payment').post(protect, verifyPayment);

module.exports = router;
