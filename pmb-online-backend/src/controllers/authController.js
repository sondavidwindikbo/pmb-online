// src/controllers/authController.js
// Controller untuk authentication (Register, Login, Logout)

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user baru (pendaftar)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, nama_lengkap } = req.body;

    // Validasi input
    if (!email || !password || !nama_lengkap) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama lengkap wajib diisi'
      });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gunakan transaction untuk insert user dan pendaftar
    const result = await transaction(async (conn) => {
      // Insert ke tabel users
      const [userResult] = await conn.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, 'pendaftar']
      );

      const userId = userResult.insertId;

      // Insert ke tabel pendaftar
      await conn.execute(
        'INSERT INTO pendaftar (user_id, nama_lengkap) VALUES (?, ?)',
        [userId, nama_lengkap]
      );

      return { userId, email };
    });

    // Generate token
    const token = generateToken(result.userId);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: {
          id: result.userId,
          email: result.email,
          role: 'pendaftar'
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    // Cari user berdasarkan email
    const users = await query(
      'SELECT id, email, password, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = users[0];

    // Cek apakah akun aktif
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak aktif. Hubungi admin'
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    // Ambil data lengkap berdasarkan role
    let userData = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    if (user.role === 'pendaftar') {
      const pendaftar = await query(
        'SELECT id, nama_lengkap, no_pendaftaran FROM pendaftar WHERE user_id = ?',
        [user.id]
      );
      if (pendaftar.length > 0) {
        userData.pendaftar = pendaftar[0];
      }
    }

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil data user
    const users = await query(
      'SELECT id, email, role, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = users[0];
    let userData = { ...user };

    // Jika pendaftar, ambil data lengkap
    if (user.role === 'pendaftar') {
      const pendaftar = await query(
        'SELECT * FROM pendaftar WHERE user_id = ?',
        [userId]
      );
      if (pendaftar.length > 0) {
        userData.pendaftar = pendaftar[0];
      }
    }

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data profil'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru wajib diisi'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    // Ambil password lama
    const users = await query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verifikasi password lama
    const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].password);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password berhasil diupdate'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update password'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword
};