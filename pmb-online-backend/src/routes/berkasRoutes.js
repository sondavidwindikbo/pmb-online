// src/routes/berkasRoutes.js
// Routes untuk upload dan verifikasi berkas

const express = require('express');
const router = express.Router();
const {
  uploadBerkas,
  getBerkasByPendaftaran,
  deleteBerkas,
  verifyBerkas,
  downloadBerkas
} = require('../controllers/berkasController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Protected routes untuk pendaftar
router.post('/', protect, authorize('pendaftar'), uploadSingle('file'), uploadBerkas);
router.delete('/:id', protect, authorize('pendaftar'), deleteBerkas);

// Protected routes untuk admin
router.put('/:id/verify', protect, authorize('admin'), verifyBerkas);

// Both roles can access
router.get('/pendaftaran/:pendaftaran_id', protect, getBerkasByPendaftaran);
router.get('/:id/download', protect, downloadBerkas);

module.exports = router;