const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require Admin role
router.use(protect, authorize('Admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/stats', getStats);

module.exports = router;
