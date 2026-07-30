const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('Admin', 'Sales Person'), upload.single('image'), createProduct);

router.route('/:id')
  .put(protect, authorize('Admin', 'Sales Person'), upload.single('image'), updateProduct)
  .delete(protect, authorize('Admin', 'Sales Person'), deleteProduct);

module.exports = router;
