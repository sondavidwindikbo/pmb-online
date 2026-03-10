// src/routes/authRoutes.js
// Routes untuk authentication

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (butuh authentication)
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;