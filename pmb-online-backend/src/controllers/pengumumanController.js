// src/controllers/pengumumanController.js
// Controller untuk pengumuman (info, kelulusan, jadwal)

const { query } = require('../config/database');
const { deleteFile } = require('../middleware/upload');

// @desc    Get all pengumuman (public/user)
// @route   GET /api/pengumuman
// @access  Public
const getAllPengumuman = async (req, res) => {
  try {
    const { 
      kategori, 
      is_active = 'true',
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    // Build WHERE clause
    let whereClause = [];
    let params = [];

    if (kategori) {
      whereClause.push('p.kategori = ?');
      params.push(kategori);
    }

    if (is_active !== 'all') {
      whereClause.push('p.is_active = ?');
      params.push(is_active === 'true' ? 1 : 0);
    }

    // Hanya tampilkan yang sudah publish
    whereClause.push('p.tanggal_publish <= NOW()');

    // Cek jika belum expired
    whereClause.push('(p.tanggal_berakhir IS NULL OR p.tanggal_berakhir >= NOW())');

    if (search) {
      whereClause.push('(p.judul LIKE ? OR p.isi LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereString = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM pengumuman p ${whereString}`;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get data dengan user info
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT p.*, u.email as created_by_email
      FROM pengumuman p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereString}
      ORDER BY p.prioritas DESC, p.tanggal_publish DESC
      LIMIT ? OFFSET ?
    `;
    
    const pengumuman = await query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: pengumuman,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pengumuman error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengumuman'
    });
  }
};

// @desc    Get single pengumuman
// @route   GET /api/pengumuman/:id
// @access  Public
const getPengumumanById = async (req, res) => {
  try {
    const { id } = req.params;

    const pengumuman = await query(
      `SELECT p.*, u.email as created_by_email
       FROM pengumuman p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (pengumuman.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengumuman tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: pengumuman[0]
    });

  } catch (error) {
    console.error('Get pengumuman by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengumuman'
    });
  }
};

// @desc    Create pengumuman
// @route   POST /api/pengumuman
// @access  Private/Admin
const createPengumuman = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      judul,
      isi,
      kategori,
      prioritas,
      tanggal_publish,
      tanggal_berakhir
    } = req.body;

    // Validasi input
    if (!judul || !isi || !kategori) {
      return res.status(400).json({
        success: false,
        message: 'Judul, isi, dan kategori wajib diisi'
      });
    }

    // Handle file attachment jika ada
    let fileAttachment = null;
    if (req.file) {
      fileAttachment = req.file.path;
    }

    // Default tanggal publish adalah sekarang jika tidak diisi
    const publishDate = tanggal_publish || new Date();

    // Insert pengumuman
    const result = await query(
      `INSERT INTO pengumuman 
       (judul, isi, kategori, prioritas, tanggal_publish, tanggal_berakhir, file_attachment, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judul, 
        isi, 
        kategori, 
        prioritas || 'medium', 
        publishDate, 
        tanggal_berakhir || null, 
        fileAttachment, 
        adminId
      ]
    );

    // Get created pengumuman
    const newPengumuman = await query(
      'SELECT * FROM pengumuman WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Pengumuman berhasil dibuat',
      data: newPengumuman[0]
    });

  } catch (error) {
    console.error('Create pengumuman error:', error);
    // Delete file jika ada error
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pengumuman'
    });
  }
};

// @desc    Update pengumuman
// @route   PUT /api/pengumuman/:id
// @access  Private/Admin
const updatePengumuman = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      isi,
      kategori,
      prioritas,
      tanggal_publish,
      tanggal_berakhir,
      is_active
    } = req.body;

    // Cek apakah pengumuman ada
    const existing = await query(
      'SELECT * FROM pengumuman WHERE id = ?', 
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengumuman tidak ditemukan'
      });
    }

    const existingData = existing[0];

    // Build update query
    const updates = [];
    const params = [];

    if (judul !== undefined) {
      updates.push('judul = ?');
      params.push(judul);
    }
    if (isi !== undefined) {
      updates.push('isi = ?');
      params.push(isi);
    }
    if (kategori !== undefined) {
      updates.push('kategori = ?');
      params.push(kategori);
    }
    if (prioritas !== undefined) {
      updates.push('prioritas = ?');
      params.push(prioritas);
    }
    if (tanggal_publish !== undefined) {
      updates.push('tanggal_publish = ?');
      params.push(tanggal_publish);
    }
    if (tanggal_berakhir !== undefined) {
      updates.push('tanggal_berakhir = ?');
      params.push(tanggal_berakhir);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    // Handle file attachment update
    if (req.file) {
      // Delete old file
      if (existingData.file_attachment) {
        deleteFile(existingData.file_attachment);
      }
      updates.push('file_attachment = ?');
      params.push(req.file.path);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate'
      });
    }

    params.push(id);

    await query(
      `UPDATE pengumuman SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated pengumuman
    const updatedPengumuman = await query(
      'SELECT * FROM pengumuman WHERE id = ?', 
      [id]
    );

    res.json({
      success: true,
      message: 'Pengumuman berhasil diupdate',
      data: updatedPengumuman[0]
    });

  } catch (error) {
    console.error('Update pengumuman error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update pengumuman'
    });
  }
};

// @desc    Delete pengumuman
// @route   DELETE /api/pengumuman/:id
// @access  Private/Admin
const deletePengumuman = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah pengumuman ada
    const existing = await query(
      'SELECT * FROM pengumuman WHERE id = ?', 
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengumuman tidak ditemukan'
      });
    }

    // Delete file attachment jika ada
    if (existing[0].file_attachment) {
      deleteFile(existing[0].file_attachment);
    }

    // Delete pengumuman
    await query('DELETE FROM pengumuman WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Pengumuman berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete pengumuman error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus pengumuman'
    });
  }
};

// @desc    Get pengumuman kelulusan by pendaftar
// @route   GET /api/pengumuman/kelulusan/my
// @access  Private (Pendaftar)
const getMyKelulusan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get pendaftar_id
    const pendaftar = await query(
      'SELECT id, nama_lengkap, no_pendaftaran FROM pendaftar WHERE user_id = ?',
      [userId]
    );

    if (pendaftar.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftar tidak ditemukan'
      });
    }

    const pendaftarData = pendaftar[0];

    // Get pendaftaran dengan status accepted
    const pendaftaran = await query(
      `SELECT pd.*, p.nama_prodi, p.fakultas, p.jenjang
       FROM pendaftaran pd
       JOIN prodi p ON pd.prodi_id = p.id
       WHERE pd.pendaftar_id = ? AND pd.status_pendaftaran = 'accepted'
       ORDER BY pd.updated_at DESC`,
      [pendaftarData.id]
    );

    // Get pengumuman kelulusan terbaru
    const pengumumanKelulusan = await query(
      `SELECT * FROM pengumuman 
       WHERE kategori = 'kelulusan' 
       AND is_active = 1 
       AND tanggal_publish <= NOW()
       AND (tanggal_berakhir IS NULL OR tanggal_berakhir >= NOW())
       ORDER BY tanggal_publish DESC
       LIMIT 1`
    );

    res.json({
      success: true,
      data: {
        pendaftar: pendaftarData,
        pendaftaran: pendaftaran,
        pengumuman: pengumumanKelulusan[0] || null,
        status: pendaftaran.length > 0 ? 'DITERIMA' : 'BELUM ADA HASIL'
      }
    });

  } catch (error) {
    console.error('Get my kelulusan error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data kelulusan'
    });
  }
};

// @desc    Get statistik pengumuman
// @route   GET /api/pengumuman/stats/summary
// @access  Private/Admin
const getPengumumanStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_pengumuman,
        SUM(CASE WHEN kategori = 'info' THEN 1 ELSE 0 END) as total_info,
        SUM(CASE WHEN kategori = 'kelulusan' THEN 1 ELSE 0 END) as total_kelulusan,
        SUM(CASE WHEN kategori = 'penting' THEN 1 ELSE 0 END) as total_penting,
        SUM(CASE WHEN kategori = 'jadwal' THEN 1 ELSE 0 END) as total_jadwal,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as total_active
      FROM pengumuman
    `);

    const recentPengumuman = await query(`
      SELECT judul, kategori, tanggal_publish
      FROM pengumuman
      ORDER BY tanggal_publish DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        summary: stats[0],
        recent: recentPengumuman
      }
    });

  } catch (error) {
    console.error('Get pengumuman stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik'
    });
  }
};

// @desc    Toggle active status pengumuman
// @route   PATCH /api/pengumuman/:id/toggle
// @access  Private/Admin
const togglePengumuman = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const pengumuman = await query(
      'SELECT is_active FROM pengumuman WHERE id = ?',
      [id]
    );

    if (pengumuman.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengumuman tidak ditemukan'
      });
    }

    const currentStatus = pengumuman[0].is_active;
    const newStatus = currentStatus ? 0 : 1;

    // Update status
    await query(
      'UPDATE pengumuman SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Pengumuman berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: { is_active: newStatus }
    });

  } catch (error) {
    console.error('Toggle pengumuman error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah status pengumuman'
    });
  }
};

module.exports = {
  getAllPengumuman,
  getPengumumanById,
  createPengumuman,
  updatePengumuman,
  deletePengumuman,
  getMyKelulusan,
  getPengumumanStats,
  togglePengumuman
};