// server.js
// Main entry point untuk aplikasi PMB Online Backend

require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');

// Port dari environment variable atau default 5000
const PORT = process.env.PORT || 5000;

// Fungsi untuk start server
const startServer = async () => {
  try {
    // Test koneksi database terlebih dahulu
    await testConnection();
    
    // Jalankan server
    app.listen(PORT, () => {
      console.log('===========================================');
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Server listening on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log('===========================================');
      console.log('Available endpoints:');
      console.log(`  GET  / - Health check`);
      console.log(`  GET  /api - API information`);
      console.log(`  POST /api/auth/register - Register user`);
      console.log(`  POST /api/auth/login - Login user`);
      console.log(`  GET  /api/auth/me - Get current user`);
      console.log(`  PUT  /api/auth/update-password - Update password`);
      console.log('===========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
startServer();