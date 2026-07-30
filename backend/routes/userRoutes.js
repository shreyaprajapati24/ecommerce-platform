const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  toggleWishlist,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/profile').get(protect, getUserProfile);
router.route('/wishlist').post(protect, toggleWishlist);
router.route('/cart')
  .post(protect, addToCart)
  .put(protect, updateCartItem)
  .delete(protect, clearCart);
router.route('/cart/:productId').delete(protect, removeFromCart);

module.exports = router;
