// src/middleware/auth.js
// Middleware untuk proteksi route dengan JWT authentication

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware untuk proteksi route (memerlukan authentication)
const protect = async (req, res, next) => {
  try {
    let token;

    // Cek apakah ada token di header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Ambil token dari header: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    // Cek apakah token ada
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Token tidak ditemukan'
      });
    }

    try {
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ambil user dari database berdasarkan id dari token
      const users = await query(
        'SELECT id, email, role, is_active FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      const user = users[0];

      // Cek apakah user masih aktif
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Akun tidak aktif'
        });
      }

      // Simpan user data ke request object
      req.user = user;
      next();

    } catch (error) {
      // Token tidak valid atau expired
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau expired'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada authentication'
    });
  }
};

// Middleware untuk authorize berdasarkan role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} tidak memiliki akses ke resource ini`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};