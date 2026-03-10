// src/controllers/prodiController.js
// Controller untuk CRUD Program Studi

const { query } = require('../config/database');

// @desc    Get all program studi (dengan filter & pagination)
// @route   GET /api/prodi
// @access  Public
const getAllProdi = async (req, res) => {
  try {
    const { 
      fakultas, 
      jenjang, 
      is_active = 'true',
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    // Build WHERE clause
    let whereClause = [];
    let params = [];

    if (fakultas) {
      whereClause.push('fakultas = ?');
      params.push(fakultas);
    }

    if (jenjang) {
      whereClause.push('jenjang = ?');
      params.push(jenjang);
    }

    if (is_active !== 'all') {
      whereClause.push('is_active = ?');
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (search) {
      whereClause.push('(nama_prodi LIKE ? OR kode_prodi LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereString = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM prodi ${whereString}`;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get data dengan pagination
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT * FROM prodi 
      ${whereString}
      ORDER BY nama_prodi ASC
      LIMIT ? OFFSET ?
    `;
    
    const prodi = await query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: prodi,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get prodi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data prodi'
    });
  }
};

// @desc    Get single program studi
// @route   GET /api/prodi/:id
// @access  Public
const getProdiById = async (req, res) => {
  try {
    const { id } = req.params;

    const prodi = await query(
      `SELECT p.*, 
       COUNT(pd.id) as total_pendaftar,
       SUM(CASE WHEN pd.status_pendaftaran = 'accepted' THEN 1 ELSE 0 END) as total_diterima
       FROM prodi p
       LEFT JOIN pendaftaran pd ON p.id = pd.prodi_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [id]
    );

    if (prodi.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program studi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: prodi[0]
    });

  } catch (error) {
    console.error('Get prodi by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data prodi'
    });
  }
};

// @desc    Create program studi baru
// @route   POST /api/prodi
// @access  Private/Admin
const createProdi = async (req, res) => {
  try {
    const {
      kode_prodi,
      nama_prodi,
      fakultas,
      jenjang,
      kuota,
      biaya_pendaftaran,
      deskripsi
    } = req.body;

    // Validasi input
    if (!kode_prodi || !nama_prodi || !fakultas || !jenjang) {
      return res.status(400).json({
        success: false,
        message: 'Kode prodi, nama prodi, fakultas, dan jenjang wajib diisi'
      });
    }

    // Cek apakah kode prodi sudah ada
    const existing = await query(
      'SELECT id FROM prodi WHERE kode_prodi = ?',
      [kode_prodi]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Kode prodi sudah digunakan'
      });
    }

    // Insert prodi
    const result = await query(
      `INSERT INTO prodi (kode_prodi, nama_prodi, fakultas, jenjang, kuota, biaya_pendaftaran, deskripsi)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kode_prodi, nama_prodi, fakultas, jenjang, kuota || 0, biaya_pendaftaran || 0, deskripsi || null]
    );

    // Get created prodi
    const newProdi = await query(
      'SELECT * FROM prodi WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Program studi berhasil ditambahkan',
      data: newProdi[0]
    });

  } catch (error) {
    console.error('Create prodi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambah prodi'
    });
  }
};

// @desc    Update program studi
// @route   PUT /api/prodi/:id
// @access  Private/Admin
const updateProdi = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      kode_prodi,
      nama_prodi,
      fakultas,
      jenjang,
      kuota,
      biaya_pendaftaran,
      deskripsi,
      is_active
    } = req.body;

    // Cek apakah prodi ada
    const existing = await query('SELECT id FROM prodi WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program studi tidak ditemukan'
      });
    }

    // Jika update kode prodi, cek duplikasi
    if (kode_prodi) {
      const duplicate = await query(
        'SELECT id FROM prodi WHERE kode_prodi = ? AND id != ?',
        [kode_prodi, id]
      );

      if (duplicate.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Kode prodi sudah digunakan'
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (kode_prodi !== undefined) {
      updates.push('kode_prodi = ?');
      params.push(kode_prodi);
    }
    if (nama_prodi !== undefined) {
      updates.push('nama_prodi = ?');
      params.push(nama_prodi);
    }
    if (fakultas !== undefined) {
      updates.push('fakultas = ?');
      params.push(fakultas);
    }
    if (jenjang !== undefined) {
      updates.push('jenjang = ?');
      params.push(jenjang);
    }
    if (kuota !== undefined) {
      updates.push('kuota = ?');
      params.push(kuota);
    }
    if (biaya_pendaftaran !== undefined) {
      updates.push('biaya_pendaftaran = ?');
      params.push(biaya_pendaftaran);
    }
    if (deskripsi !== undefined) {
      updates.push('deskripsi = ?');
      params.push(deskripsi);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate'
      });
    }

    params.push(id);

    await query(
      `UPDATE prodi SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated prodi
    const updatedProdi = await query('SELECT * FROM prodi WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Program studi berhasil diupdate',
      data: updatedProdi[0]
    });

  } catch (error) {
    console.error('Update prodi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update prodi'
    });
  }
};

// @desc    Delete program studi
// @route   DELETE /api/prodi/:id
// @access  Private/Admin
const deleteProdi = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah prodi ada
    const existing = await query('SELECT id FROM prodi WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program studi tidak ditemukan'
      });
    }

    // Cek apakah ada pendaftaran yang menggunakan prodi ini
    const hasPendaftaran = await query(
      'SELECT id FROM pendaftaran WHERE prodi_id = ? LIMIT 1',
      [id]
    );

    if (hasPendaftaran.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus prodi yang sudah memiliki pendaftar. Nonaktifkan saja prodi ini.'
      });
    }

    // Delete prodi
    await query('DELETE FROM prodi WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Program studi berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete prodi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus prodi'
    });
  }
};

// @desc    Get statistik prodi
// @route   GET /api/prodi/stats/summary
// @access  Private/Admin
const getProdiStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_prodi,
        COUNT(DISTINCT p.fakultas) as total_fakultas,
        SUM(p.kuota) as total_kuota,
        COUNT(pd.id) as total_pendaftar,
        SUM(CASE WHEN pd.status_pendaftaran = 'accepted' THEN 1 ELSE 0 END) as total_diterima
      FROM prodi p
      LEFT JOIN pendaftaran pd ON p.id = pd.prodi_id
      WHERE p.is_active = 1
    `);

    const prodiByFakultas = await query(`
      SELECT 
        fakultas,
        COUNT(*) as jumlah_prodi,
        SUM(kuota) as total_kuota
      FROM prodi
      WHERE is_active = 1
      GROUP BY fakultas
      ORDER BY jumlah_prodi DESC
    `);

    res.json({
      success: true,
      data: {
        summary: stats[0],
        by_fakultas: prodiByFakultas
      }
    });

  } catch (error) {
    console.error('Get prodi stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik'
    });
  }
};

module.exports = {
  getAllProdi,
  getProdiById,
  createProdi,
  updateProdi,
  deleteProdi,
  getProdiStats
};