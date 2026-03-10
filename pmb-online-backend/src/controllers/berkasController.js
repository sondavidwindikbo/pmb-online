// src/controllers/berkasController.js
// Controller untuk upload dan verifikasi berkas

const { query } = require('../config/database');
const { deleteFile } = require('../middleware/upload');
const path = require('path');

// @desc    Upload berkas
// @route   POST /api/berkas
// @access  Private (Pendaftar)
const uploadBerkas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pendaftaran_id, jenis_berkas } = req.body;

    // Validasi
    if (!pendaftaran_id || !jenis_berkas) {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran ID dan jenis berkas wajib diisi'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File wajib diupload'
      });
    }

    // Cek apakah pendaftaran milik user ini
    const pendaftaran = await query(
      `SELECT pd.id, pd.status_pendaftaran, pf.user_id 
       FROM pendaftaran pd
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE pd.id = ?`,
      [pendaftaran_id]
    );

    if (pendaftaran.length === 0) {
      // Delete uploaded file
      deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Pendaftaran tidak ditemukan'
      });
    }

    const data = pendaftaran[0];

    // Cek ownership
    if (data.user_id !== userId) {
      deleteFile(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk upload berkas ke pendaftaran ini'
      });
    }

    // Tidak bisa upload jika sudah disubmit
    if (data.status_pendaftaran !== 'draft') {
      deleteFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa upload berkas setelah pendaftaran disubmit'
      });
    }

    // Cek apakah jenis berkas sudah diupload sebelumnya
    const existing = await query(
      'SELECT id, file_path FROM berkas WHERE pendaftaran_id = ? AND jenis_berkas = ?',
      [pendaftaran_id, jenis_berkas]
    );

    // Jika sudah ada, delete file lama dan update
    if (existing.length > 0) {
      const oldFilePath = existing[0].file_path;
      deleteFile(oldFilePath);

      // Update berkas
      await query(
        `UPDATE berkas 
         SET nama_file = ?, file_path = ?, file_size = ?, mime_type = ?, 
             status_verifikasi = 'pending', uploaded_at = NOW()
         WHERE id = ?`,
        [req.file.filename, req.file.path, req.file.size, req.file.mimetype, existing[0].id]
      );

      // Get updated berkas
      const updated = await query('SELECT * FROM berkas WHERE id = ?', [existing[0].id]);

      return res.json({
        success: true,
        message: 'Berkas berhasil diupdate',
        data: updated[0]
      });
    }

    // Insert berkas baru
    const result = await query(
      `INSERT INTO berkas (pendaftaran_id, jenis_berkas, nama_file, file_path, file_size, mime_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [pendaftaran_id, jenis_berkas, req.file.filename, req.file.path, req.file.size, req.file.mimetype]
    );

    // Get inserted berkas
    const newBerkas = await query('SELECT * FROM berkas WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Berkas berhasil diupload',
      data: newBerkas[0]
    });

  } catch (error) {
    console.error('Upload berkas error:', error);
    // Delete file jika terjadi error
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat upload berkas'
    });
  }
};

// @desc    Get berkas by pendaftaran_id
// @route   GET /api/berkas/pendaftaran/:pendaftaran_id
// @access  Private
const getBerkasByPendaftaran = async (req, res) => {
  try {
    const { pendaftaran_id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get pendaftaran untuk cek ownership
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
        message: 'Anda tidak memiliki akses ke data ini'
      });
    }

    // Get berkas
    const berkas = await query(
      'SELECT * FROM berkas WHERE pendaftaran_id = ? ORDER BY jenis_berkas',
      [pendaftaran_id]
    );

    res.json({
      success: true,
      data: berkas
    });

  } catch (error) {
    console.error('Get berkas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data berkas'
    });
  }
};

// @desc    Delete berkas
// @route   DELETE /api/berkas/:id
// @access  Private (Pendaftar)
const deleteBerkas = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get berkas dan cek ownership
    const berkas = await query(
      `SELECT b.*, pd.status_pendaftaran, pf.user_id
       FROM berkas b
       JOIN pendaftaran pd ON b.pendaftaran_id = pd.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE b.id = ?`,
      [id]
    );

    if (berkas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Berkas tidak ditemukan'
      });
    }

    const data = berkas[0];

    // Cek ownership
    if (data.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk delete berkas ini'
      });
    }

    // Tidak bisa delete jika pendaftaran sudah disubmit
    if (data.status_pendaftaran !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Tidak bisa delete berkas setelah pendaftaran disubmit'
      });
    }

    // Delete file dari storage
    deleteFile(data.file_path);

    // Delete dari database
    await query('DELETE FROM berkas WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Berkas berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete berkas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat delete berkas'
    });
  }
};

// @desc    Verifikasi berkas (approve/reject)
// @route   PUT /api/berkas/:id/verify
// @access  Private/Admin
const verifyBerkas = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body; // status: 'approved' atau 'rejected'
    const adminId = req.user.id;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus "approved" atau "rejected"'
      });
    }

    // Get berkas
    const berkas = await query('SELECT id FROM berkas WHERE id = ?', [id]);

    if (berkas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Berkas tidak ditemukan'
      });
    }

    // Update status verifikasi
    await query(
      `UPDATE berkas 
       SET status_verifikasi = ?, 
           catatan = ?,
           verified_at = NOW(),
           verified_by = ?
       WHERE id = ?`,
      [status, catatan || null, adminId, id]
    );

    res.json({
      success: true,
      message: `Berkas berhasil ${status === 'approved' ? 'diapprove' : 'ditolak'}`
    });

  } catch (error) {
    console.error('Verify berkas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi berkas'
    });
  }
};

// @desc    Download berkas
// @route   GET /api/berkas/:id/download
// @access  Private
const downloadBerkas = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get berkas
    const berkas = await query(
      `SELECT b.*, pf.user_id
       FROM berkas b
       JOIN pendaftaran pd ON b.pendaftaran_id = pd.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE b.id = ?`,
      [id]
    );

    if (berkas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Berkas tidak ditemukan'
      });
    }

    const data = berkas[0];

    // Cek authorization
    if (userRole !== 'admin' && data.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk download berkas ini'
      });
    }

    // Send file
    res.download(data.file_path, data.nama_file);

  } catch (error) {
    console.error('Download berkas error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat download berkas'
    });
  }
};

module.exports = {
  uploadBerkas,
  getBerkasByPendaftaran,
  deleteBerkas,
  verifyBerkas,
  downloadBerkas
};