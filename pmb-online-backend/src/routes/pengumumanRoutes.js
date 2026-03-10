// src/routes/pengumumanRoutes.js
// Routes untuk pengumuman

const express = require('express');
const router = express.Router();
const {
  getAllPengumuman,
  getPengumumanById,
  createPengumuman,
  updatePengumuman,
  deletePengumuman,
  getMyKelulusan,
  getPengumumanStats,
  togglePengumuman
} = require('../controllers/pengumumanController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', getAllPengumuman);
router.get('/:id', getPengumumanById);

// Protected routes untuk pendaftar
router.get('/kelulusan/my', protect, authorize('pendaftar'), getMyKelulusan);

// Protected routes untuk admin
router.post('/', protect, authorize('admin'), uploadSingle('file'), createPengumuman);
router.put('/:id', protect, authorize('admin'), uploadSingle('file'), updatePengumuman);
router.delete('/:id', protect, authorize('admin'), deletePengumuman);
router.patch('/:id/toggle', protect, authorize('admin'), togglePengumuman);
router.get('/stats/summary', protect, authorize('admin'), getPengumumanStats);

module.exports = router;