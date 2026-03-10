// src/controllers/pendaftaranController.js
// Controller untuk proses pendaftaran mahasiswa baru

const { query, transaction } = require('../config/database');

// Helper: Generate nomor pendaftaran
const generateNoPendaftaran = async (prodiId) => {
  const year = new Date().getFullYear();
  
  // Get kode prodi
  const prodi = await query('SELECT kode_prodi FROM prodi WHERE id = ?', [prodiId]);
  if (prodi.length === 0) return null;
  
  const kodeProdi = prodi[0].kode_prodi;
  
  // Count pendaftar untuk prodi ini di tahun ini
  const count = await query(
    `SELECT COUNT(*) as total FROM pendaftaran 
     WHERE prodi_id = ? AND YEAR(tanggal_daftar) = ?`,
    [prodiId, year]
  );
  
  const counter = count[0].total + 1;
  
  // Format: PMB-2025-TI01-0001
  return `PMB-${year}-${kodeProdi}-${String(counter).padStart(4, '0')}`;
};

// @desc    Create pendaftaran baru
// @route   POST /api/pendaftaran
// @access  Private (Pendaftar)
const createPendaftaran = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      prodi_id,
      jalur_masuk,
      asal_sekolah,
      npsn,
      jurusan_sekolah,
      tahun_lulus,
      nilai_rata_rata,
      // Data pribadi untuk update pendaftar
      nik,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      agama,
      alamat,
      kabupaten,
      provinsi,
      kode_pos,
      no_hp,
      nama_ortu,
      pekerjaan_ortu,
      penghasilan_ortu,
      no_hp_ortu
    } = req.body;

    // Validasi input
    if (!prodi_id || !jalur_masuk || !jenis_kelamin) {
      return res.status(400).json({
        success: false,
        message: 'Prodi, jalur masuk, dan jenis kelamin wajib diisi'
      });
    }

    // Cek apakah prodi ada dan aktif
    const prodi = await query(
      'SELECT id, is_active FROM prodi WHERE id = ? AND is_active = 1',
      [prodi_id]
    );

    if (prodi.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Program studi tidak ditemukan atau tidak aktif'
      });
    }

    // Get pendaftar_id dari user_id
    const pendaftar = await query(
      'SELECT id FROM pendaftar WHERE user_id = ?',
      [userId]
    );

    if (pendaftar.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftar tidak ditemukan'
      });
    }

    const pendaftarId = pendaftar[0].id;

    // Cek apakah sudah pernah daftar di prodi yang sama
    const existingPendaftaran = await query(
      `SELECT id FROM pendaftaran 
       WHERE pendaftar_id = ? AND prodi_id = ? 
       AND status_pendaftaran IN ('draft', 'submitted', 'verified', 'accepted')`,
      [pendaftarId, prodi_id]
    );

    if (existingPendaftaran.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah terdaftar di program studi ini'
      });
    }

    // Generate nomor pendaftaran
    const noPendaftaran = await generateNoPendaftaran(prodi_id);

    // Get tahun akademik aktif dari settings
    const tahunAkademik = await query(
      "SELECT setting_value FROM settings WHERE setting_key = 'tahun_akademik_aktif'"
    );
    const tahunAkademikValue = tahunAkademik.length > 0 ? tahunAkademik[0].setting_value : `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

    // Use transaction untuk update pendaftar dan insert pendaftaran
    const result = await transaction(async (conn) => {
      // Update data pendaftar jika ada
      const updates = [];
      const params = [];

      if (nik) {
        updates.push('nik = ?');
        params.push(nik);
      }
      if (tempat_lahir) {
        updates.push('tempat_lahir = ?');
        params.push(tempat_lahir);
      }
      if (tanggal_lahir) {
        updates.push('tanggal_lahir = ?');
        params.push(tanggal_lahir);
      }
      if (jenis_kelamin) {
        updates.push('jenis_kelamin = ?');
        params.push(jenis_kelamin);
      }
      if (agama) {
        updates.push('agama = ?');
        params.push(agama);
      }
      if (alamat) {
        updates.push('alamat = ?');
        params.push(alamat);
      }
      if (kabupaten) {
        updates.push('kabupaten = ?');
        params.push(kabupaten);
      }
      if (provinsi) {
        updates.push('provinsi = ?');
        params.push(provinsi);
      }
      if (kode_pos) {
        updates.push('kode_pos = ?');
        params.push(kode_pos);
      }
      if (no_hp) {
        updates.push('no_hp = ?');
        params.push(no_hp);
      }
      if (nama_ortu) {
        updates.push('nama_ortu = ?');
        params.push(nama_ortu);
      }
      if (pekerjaan_ortu) {
        updates.push('pekerjaan_ortu = ?');
        params.push(pekerjaan_ortu);
      }
      if (penghasilan_ortu) {
        updates.push('penghasilan_ortu = ?');
        params.push(penghasilan_ortu);
      }
      if (no_hp_ortu) {
        updates.push('no_hp_ortu = ?');
        params.push(no_hp_ortu);
      }
      if (noPendaftaran) {
        updates.push('no_pendaftaran = ?');
        params.push(noPendaftaran);
      }

      if (updates.length > 0) {
        params.push(pendaftarId);
        await conn.execute(
          `UPDATE pendaftar SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      // Insert pendaftaran
      const [pendaftaranResult] = await conn.execute(
        `INSERT INTO pendaftaran 
         (pendaftar_id, prodi_id, jalur_masuk, tahun_akademik, asal_sekolah, npsn, 
          jurusan_sekolah, tahun_lulus, nilai_rata_rata, status_pendaftaran)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [pendaftarId, prodi_id, jalur_masuk, tahunAkademikValue, asal_sekolah, npsn,
         jurusan_sekolah, tahun_lulus, nilai_rata_rata]
      );

      return pendaftaranResult.insertId;
    });

    // Get created pendaftaran with related data
    const newPendaftaran = await query(
      `SELECT pd.*, p.nama_prodi, p.fakultas, p.jenjang, pf.nama_lengkap, pf.no_pendaftaran
       FROM pendaftaran pd
       JOIN prodi p ON pd.prodi_id = p.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE pd.id = ?`,
      [result]
    );

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil dibuat. Silakan lengkapi data dan upload berkas.',
      data: newPendaftaran[0]
    });

  } catch (error) {
    console.error('Create pendaftaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pendaftaran'
    });
  }
};

// @desc    Get pendaftaran user (untuk pendaftar)
// @route   GET /api/pendaftaran/my
// @access  Private (Pendaftar)
const getMyPendaftaran = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get pendaftar_id
    const pendaftar = await query(
      'SELECT id FROM pendaftar WHERE user_id = ?',
      [userId]
    );

    if (pendaftar.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftar tidak ditemukan'
      });
    }

    // Get pendaftaran dengan join
    const pendaftaran = await query(
      `SELECT pd.*, 
              p.nama_prodi, p.fakultas, p.jenjang, p.biaya_pendaftaran,
              pf.nama_lengkap, pf.no_pendaftaran, pf.nik, pf.no_hp,
              COUNT(b.id) as total_berkas,
              SUM(CASE WHEN b.status_verifikasi = 'approved' THEN 1 ELSE 0 END) as berkas_approved,
              pm.status_pembayaran
       FROM pendaftaran pd
       JOIN prodi p ON pd.prodi_id = p.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       LEFT JOIN berkas b ON pd.id = b.pendaftaran_id
       LEFT JOIN pembayaran pm ON pd.id = pm.pendaftaran_id
       WHERE pd.pendaftar_id = ?
       GROUP BY pd.id
       ORDER BY pd.created_at DESC`,
      [pendaftar[0].id]
    );

    res.json({
      success: true,
      data: pendaftaran
    });

  } catch (error) {
    console.error('Get my pendaftaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pendaftaran'
    });
  }
};

// @desc    Get single pendaftaran
// @route   GET /api/pendaftaran/:id
// @access  Private
const getPendaftaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get pendaftaran
    const pendaftaran = await query(
      `SELECT pd.*, 
              p.nama_prodi, p.fakultas, p.jenjang, p.biaya_pendaftaran, p.kode_prodi,
              pf.*, u.email
       FROM pendaftaran pd
       JOIN prodi p ON pd.prodi_id = p.id
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       JOIN users u ON pf.user_id = u.id
       WHERE pd.id = ?`,
      [id]
    );

    if (pendaftaran.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pendaftaran tidak ditemukan'
      });
    }

    const data = pendaftaran[0];

    // Cek authorization (hanya pemilik atau admin yang bisa akses)
    if (userRole !== 'admin' && data.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke data ini'
      });
    }

    // Get berkas
    const berkas = await query(
      'SELECT * FROM berkas WHERE pendaftaran_id = ?',
      [id]
    );

    // Get pembayaran
    const pembayaran = await query(
      'SELECT * FROM pembayaran WHERE pendaftaran_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...data,
        berkas,
        pembayaran: pembayaran[0] || null
      }
    });

  } catch (error) {
    console.error('Get pendaftaran by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pendaftaran'
    });
  }
};

// @desc    Update pendaftaran (untuk pendaftar)
// @route   PUT /api/pendaftaran/:id
// @access  Private (Pendaftar)
const updatePendaftaran = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    // Get pendaftaran dan cek ownership
    const pendaftaran = await query(
      `SELECT pd.*, pf.user_id 
       FROM pendaftaran pd
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       WHERE pd.id = ?`,
      [id]
    );

    if (pendaftaran.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pendaftaran tidak ditemukan'
      });
    }

    const existing = pendaftaran[0];

    // Cek ownership
    if (existing.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses untuk update data ini'
      });
    }

    // Hanya bisa update jika status masih draft
    if (existing.status_pendaftaran !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran yang sudah disubmit tidak bisa diubah'
      });
    }

    // Build update query
    const updates = [];
    const params = [];

    const allowedFields = [
      'asal_sekolah', 'npsn', 'jurusan_sekolah', 
      'tahun_lulus', 'nilai_rata_rata'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate'
      });
    }

    params.push(id);

    await query(
      `UPDATE pendaftaran SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Get updated data
    const updated = await query(
      `SELECT pd.*, p.nama_prodi, p.fakultas
       FROM pendaftaran pd
       JOIN prodi p ON pd.prodi_id = p.id
       WHERE pd.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Pendaftaran berhasil diupdate',
      data: updated[0]
    });

  } catch (error) {
    console.error('Update pendaftaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update pendaftaran'
    });
  }
};

// @desc    Submit pendaftaran (finalisasi)
// @route   POST /api/pendaftaran/:id/submit
// @access  Private (Pendaftar)
const submitPendaftaran = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get pendaftaran
    const pendaftaran = await query(
      `SELECT pd.*, pf.user_id,
              COUNT(b.id) as total_berkas,
              pm.status_pembayaran
       FROM pendaftaran pd
       JOIN pendaftar pf ON pd.pendaftar_id = pf.id
       LEFT JOIN berkas b ON pd.id = b.pendaftaran_id
       LEFT JOIN pembayaran pm ON pd.id = pm.pendaftaran_id
       WHERE pd.id = ?
       GROUP BY pd.id`,
      [id]
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
        message: 'Anda tidak memiliki akses untuk submit data ini'
      });
    }

    // Validasi: harus sudah upload minimal berkas wajib
    if (data.total_berkas < 3) {
      return res.status(400).json({
        success: false,
        message: 'Mohon upload minimal 3 berkas (KTP, Ijazah, Foto)'
      });
    }

    // Validasi: pembayaran harus sudah paid
    if (data.status_pembayaran !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Mohon selesaikan pembayaran terlebih dahulu'
      });
    }

    // Update status ke submitted
    await query(
      'UPDATE pendaftaran SET status_pendaftaran = "submitted" WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Pendaftaran berhasil disubmit. Menunggu verifikasi admin.'
    });

  } catch (error) {
    console.error('Submit pendaftaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat submit pendaftaran'
    });
  }
};

// @desc    Get all pendaftaran (untuk admin)
// @route   GET /api/pendaftaran
// @access  Private/Admin
const getAllPendaftaran = async (req, res) => {
  try {
    const {
      status,
      prodi_id,
      jalur_masuk,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build WHERE clause
    let whereClause = [];
    let params = [];

    if (status) {
      whereClause.push('pd.status_pendaftaran = ?');
      params.push(status);
    }

    if (prodi_id) {
      whereClause.push('pd.prodi_id = ?');
      params.push(prodi_id);
    }

    if (jalur_masuk) {
      whereClause.push('pd.jalur_masuk = ?');
      params.push(jalur_masuk);
    }

    if (search) {
      whereClause.push('(pf.nama_lengkap LIKE ? OR pf.no_pendaftaran LIKE ? OR pf.nik LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereString = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM pendaftaran pd
      JOIN pendaftar pf ON pd.pendaftar_id = pf.id
      ${whereString}
    `;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get data
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT pd.*, 
             p.nama_prodi, p.fakultas, p.kode_prodi,
             pf.nama_lengkap, pf.no_pendaftaran, pf.nik, pf.no_hp,
             u.email,
             pm.status_pembayaran
      FROM pendaftaran pd
      JOIN prodi p ON pd.prodi_id = p.id
      JOIN pendaftar pf ON pd.pendaftar_id = pf.id
      JOIN users u ON pf.user_id = u.id
      LEFT JOIN pembayaran pm ON pd.id = pm.pendaftaran_id
      ${whereString}
      ORDER BY pd.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const pendaftaran = await query(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: pendaftaran,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all pendaftaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pendaftaran'
    });
  }
};

// @desc    Verifikasi pendaftaran (approve/reject)
// @route   PUT /api/pendaftaran/:id/verify
const verifyPendaftaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;
    const adminId = req.user.id;

    // ✅ Tambah 'accepted' di list status yang valid
    const validStatus = ['verified', 'rejected', 'accepted'];
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus "verified", "rejected", atau "accepted"'
      });
    }

    // Cek pendaftaran ada
    const pendaftaran = await query(
      'SELECT id, status_pendaftaran FROM pendaftaran WHERE id = ?',
      [id]
    );

    if (pendaftaran.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pendaftaran tidak ditemukan'
      });
    }

    // Update status pendaftaran
    await query(
      `UPDATE pendaftaran 
       SET status_pendaftaran = ?,
           catatan = ?,
           tanggal_verifikasi = NOW(),
           verified_by = ?
       WHERE id = ?`,
      [status, catatan || null, adminId, id]
    );

    const msgMap = {
      verified: 'Pendaftaran berhasil diverifikasi',
      rejected: 'Pendaftaran ditolak',
      accepted: 'Pendaftar berhasil dinyatakan DITERIMA',
    };

    res.json({
      success: true,
      message: msgMap[status]
    });

  } catch (error) {
    console.error('Verify pendaftaran error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi pendaftaran'
    });
  }
};

module.exports = {
  createPendaftaran,
  getMyPendaftaran,
  getPendaftaranById,
  updatePendaftaran,
  submitPendaftaran,
  getAllPendaftaran,
  verifyPendaftaran
};