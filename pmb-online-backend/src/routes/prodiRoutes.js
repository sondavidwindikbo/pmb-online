// src/routes/prodiRoutes.js
// Routes untuk CRUD Program Studi

const express = require('express');
const router = express.Router();
const {
  getAllProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
  getProdiStats
} = require('../controllers/prodiController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllProdi);
router.get('/:id', getProdiById);

// Admin only routes
router.post('/', protect, authorize('admin'), createProdi);
router.put('/:id', protect, authorize('admin'), updateProdi);
router.delete('/:id', protect, authorize('admin'), deleteProdi);
router.get('/stats/summary', protect, authorize('admin'), getProdiStats);

module.exports = router;