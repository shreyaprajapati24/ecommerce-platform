const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/orders/create-razorpay-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    user.cart.forEach(item => {
      if (item.product) {
        totalAmount += item.product.price * item.quantity;
      }
    });

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid cart total' });
    }

    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Payment and Create Order
// @route   POST /api/orders/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ message: 'Transaction not legit!' });
    }

    // Payment legit, create order in DB
    const user = await User.findById(req.user._id).populate('cart.product');

    let totalAmount = 0;
    const orderProducts = user.cart
      .filter(item => item.product) // Skip items with deleted products
      .map(item => {
        totalAmount += item.product.price * item.quantity;
        return {
          product: item.product._id,
          quantity: item.quantity,
          priceAtPurchase: item.product.price
        };
      });

    const newOrder = await Order.create({
      user: req.user._id,
      products: orderProducts,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'Success'
    });

    // Clear cart
    user.cart = [];
    await user.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders based on role
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let orders = [];

    if (req.user.role === 'Admin') {
      orders = await Order.find().populate('user', 'name email').populate('products.product').sort({ createdAt: -1 });
    } else if (req.user.role === 'Sales Person') {
      // Find products owned by Sales Person
      const myProducts = await Product.find({ sellerId: req.user._id }).select('_id');
      const myProductIds = myProducts.map(p => p._id.toString());

      // Find orders containing any of these products
      const allOrders = await Order.find().populate('user', 'name email').populate('products.product').sort({ createdAt: -1 });
      orders = allOrders.filter(order =>
        order.products.some(item => {
          if (item.product && item.product._id) {
            return myProductIds.includes(item.product._id.toString());
          }
          return false;
        })
      );
    } else {
      // Regular User
      orders = await Order.find({ user: req.user._id }).populate('products.product').sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getOrders
};
