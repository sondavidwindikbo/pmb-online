// src/routes/pembayaranRoutes.js
// Routes untuk pembayaran

const express = require('express');
const router = express.Router();
const {
  createPembayaran,
  uploadBuktiPembayaran,
  getPembayaranByPendaftaran,
  getAllPembayaran,
  verifyPembayaran
} = require('../controllers/pembayaranController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Protected routes untuk pendaftar
router.post('/', protect, authorize('pendaftar'), createPembayaran);
router.post('/:id/upload-bukti', protect, authorize('pendaftar'), uploadSingle('file'), uploadBuktiPembayaran);

// Protected routes untuk admin
router.get('/', protect, authorize('admin'), getAllPembayaran);
router.put('/:id/verify', protect, authorize('admin'), verifyPembayaran);

// Both roles can access
router.get('/pendaftaran/:pendaftaran_id', protect, getPembayaranByPendaftaran);

module.exports = router;