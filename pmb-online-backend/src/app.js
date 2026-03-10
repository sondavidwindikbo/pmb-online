// src/app.js
// Setup Express application dengan middleware

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Static files untuk upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request Logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PMB Online API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes (akan kita tambahkan nanti)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PMB Online API v1.0',
    endpoints: {
      auth: '/api/auth',
      prodi: '/api/prodi',
      pendaftaran: '/api/pendaftaran',
      berkas: '/api/berkas',
      pembayaran: '/api/pembayaran',
      pengumuman: '/api/pengumuman'
    }
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const prodiRoutes = require('./routes/prodiRoutes');
const pendaftaranRoutes = require('./routes/pendaftaranRoutes');
const berkasRoutes = require('./routes/berkasRoutes');
const pembayaranRoutes = require('./routes/pembayaranRoutes');
const pengumumanRoutes = require('./routes/pengumumanRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/prodi', prodiRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);
app.use('/api/berkas', berkasRoutes);
app.use('/api/pembayaran', pembayaranRoutes);
app.use('/api/pengumuman', pengumumanRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;