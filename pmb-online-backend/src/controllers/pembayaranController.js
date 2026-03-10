// src/controllers/pembayaranController.js
// Controller untuk pembayaran pendaftaran

const { query } = require('../config/database');
const { deleteFile } = require('../middleware/upload');

// Helper: Generate kode pembayaran
const generateKodePembayaran = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY-${timestamp}-${random}`;
};

// @desc    Create pembayaran
// @route   POST /api/pembayaran
// @access  Private (Pendaftar)
const createPembayaran = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pendaftaran_id, metode_pembayaran, bank, nomor_rekening } = req.body;

    // Validasi
    if (!pendaftaran_id || !metode_pembayaran) {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran ID dan metode pembayaran wajib diisi'
      });
    }

    // Cek pendaftaran dan ownership
    const pendaftaran = await query(
      `SELECT pd.id, pd.status_pendaftaran, p.biaya_pendaftaran, pf.user_id
       FROM pendaftaran pd
       JOIN prodi p ON pd.prodi_id = p.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE pd.id = ?`,
      [pendaftaran_id]
    );

    if (pendaftaran.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pendaftaran tidak ditemukan'
      });
    }

    const data = pendaftaran[0];

    // Cek ownership
    if (data.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    // Cek apakah sudah ada pembayaran
    const existing = await query(
      'SELECT id, status_pembayaran FROM pembayaran WHERE pendaftaran_id = ?',
      [pendaftaran_id]
    );

    if (existing.length > 0 && existing[0].status_pembayaran === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Pembayaran sudah lunas'
      });
    }

    const kodePembayaran = generateKodePembayaran();
    const jumlah = data.biaya_pendaftaran;
    
    // Expired 24 jam dari sekarang
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    let result;

    // Jika sudah ada pembayaran tapi belum paid, update
    if (existing.length > 0) {
      await query(
        `UPDATE pembayaran 
         SET kode_pembayaran = ?, metode_pembayaran = ?, bank = ?, 
             nomor_rekening = ?, expired_at = ?, status_pembayaran = 'pending'
         WHERE id = ?`,
        [kodePembayaran, metode_pembayaran, bank, nomor_rekening, expiredAt, existing[0].id]
      );
      result = { insertId: existing[0].id };
    } else {
      // Insert baru
      result = await query(
        `INSERT INTO pembayaran (pendaftaran_id, kode_pembayaran, jumlah, metode_pembayaran, 
                                 bank, nomor_rekening, expired_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pendaftaran_id, kodePembayaran, jumlah, metode_pembayaran, bank, nomor_rekening, expiredAt]
      );
    }

    // Get pembayaran
    const pembayaran = await query('SELECT * FROM pembayaran WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Kode pembayaran berhasil dibuat. Silakan lakukan pembayaran dan upload bukti.',
      data: pembayaran[0]
    });

  } catch (error) {
    console.error('Create pembayaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pembayaran'
    });
  }
};

// @desc    Upload bukti pembayaran
// @route   POST /api/pembayaran/:id/upload-bukti
// @access  Private (Pendaftar)
const uploadBuktiPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File bukti pembayaran wajib diupload'
      });
    }

    // Get pembayaran
    const pembayaran = await query(
      `SELECT pm.*, pf.user_id
       FROM pembayaran pm
       JOIN pendaftaran pd ON pm.pendaftaran_id = pd.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE pm.id = ?`,
      [id]
    );

    if (pembayaran.length === 0) {
      deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    const data = pembayaran[0];

    // Cek ownership
    if (data.user_id !== userId) {
      deleteFile(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    // Cek expired
    if (new Date() > new Date(data.expired_at)) {
      deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Kode pembayaran sudah expired'
      });
    }

    // Delete bukti lama jika ada
    if (data.bukti_pembayaran) {
      deleteFile(data.bukti_pembayaran);
    }

    // Update bukti pembayaran
    await query(
      `UPDATE pembayaran 
       SET bukti_pembayaran = ?, tanggal_bayar = NOW(), status_pembayaran = 'paid'
       WHERE id = ?`,
      [req.file.path, id]
    );

    // Get updated pembayaran
    const updated = await query('SELECT * FROM pembayaran WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.',
      data: updated[0]
    });

  } catch (error) {
    console.error('Upload bukti error:', error);
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat upload bukti pembayaran'
    });
  }
};

// @desc    Get pembayaran by pendaftaran_id
// @route   GET /api/pembayaran/pendaftaran/:pendaftaran_id
// @access  Private
const getPembayaranByPendaftaran = async (req, res) => {
  try {
    const { pendaftaran_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Cek pendaftaran dan ownership
    const pendaftaran = await query(
      `SELECT pf.user_id FROM pendaftaran pd
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE pd.id = ?`,
      [pendaftaran_id]
    );

    if (pendaftaran.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pendaftaran tidak ditemukan'
      });
    }

    // Cek authorization
    if (userRole !== 'admin' && pendaftaran[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    // Get pembayaran
    const pembayaran = await query(
      'SELECT * FROM pembayaran WHERE pendaftaran_id = ?',
      [pendaftaran_id]
    );

    res.json({
      success: true,
      data: pembayaran[0] || null
    });

  } catch (error) {
    console.error('Get pembayaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pembayaran'
    });
  }
};

// @desc    Get all pembayaran (untuk admin)
// @route   GET /api/pembayaran
// @access  Private/Admin
const getAllPembayaran = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Build WHERE clause
    let whereClause = '';
    let params = [];

    if (status) {
      whereClause = 'WHERE pm.status_pembayaran = ?';
      params.push(status);
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM pembayaran pm
      ${whereClause}
    `;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get data
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT pm.*, 
             pd.id as pendaftaran_id,
             p.nama_prodi,
             pf.nama_lengkap, pf.no_pendaftaran
      FROM pembayaran pm
      JOIN pendaftaran pd ON pm.pendaftaran_id = pd.id
      JOIN prodi p ON pd.prodi_id = p.id
      JOIN pendaftar pf ON pd.pendaftar_id = pf.id
      ${whereClause}
      ORDER BY pm.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const pembayaran = await query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: pembayaran,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all pembayaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pembayaran'
    });
  }
};

// @desc    Verifikasi pembayaran
// @route   PUT /api/pembayaran/:id/verify
// @access  Private/Admin
const verifyPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body; // status: 'paid' atau 'failed'
    const adminId = req.user.id;

    if (!status || !['paid', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus "paid" atau "failed"'
      });
    }

    // Get pembayaran
    const pembayaran = await query('SELECT id FROM pembayaran WHERE id = ?', [id]);

    if (pembayaran.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan'
      });
    }

    // Update status
    await query(
      `UPDATE pembayaran 
       SET status_pembayaran = ?, catatan = ?, verified_at = NOW(), verified_by = ?
       WHERE id = ?`,
      [status, catatan || null, adminId, id]
    );

    res.json({
      success: true,
      message: `Pembayaran berhasil ${status === 'paid' ? 'diverifikasi' : 'ditolak'}`
    });

  } catch (error) {
    console.error('Verify pembayaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi pembayaran'
    });
  }
};

module.exports = {
  createPembayaran,
  uploadBuktiPembayaran,
  getPembayaranByPendaftaran,
  getAllPembayaran,
  verifyPembayaran
};