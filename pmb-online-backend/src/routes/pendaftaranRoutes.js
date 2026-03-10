// src/routes/pendaftaranRoutes.js
// Routes untuk pendaftaran mahasiswa baru

const express = require('express');
const router = express.Router();
const {
  createPendaftaran,
  getMyPendaftaran,
  getPendaftaranById,
  updatePendaftaran,
  submitPendaftaran,
  getAllPendaftaran,
  verifyPendaftaran
} = require('../controllers/pendaftaranController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes untuk pendaftar
router.post('/', protect, authorize('pendaftar'), createPendaftaran);
router.get('/my', protect, authorize('pendaftar'), getMyPendaftaran);
router.put('/:id', protect, authorize('pendaftar'), updatePendaftaran);
router.post('/:id/submit', protect, authorize('pendaftar'), submitPendaftaran);

// Protected routes untuk admin
router.get('/', protect, authorize('admin'), getAllPendaftaran);
router.put('/:id/verify', protect, authorize('admin'), verifyPendaftaran);

// Both roles can access
router.get('/:id', protect, getPendaftaranById);

module.exports = router;