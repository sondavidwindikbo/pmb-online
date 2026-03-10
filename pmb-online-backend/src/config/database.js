// src/config/database.js
// Konfigurasi koneksi MySQL menggunakan mysql2 dengan promise

const mysql = require('mysql2');
require('dotenv').config();

// Buat connection pool untuk performa lebih baik
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pmb_online_usnp',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Maksimal 10 koneksi bersamaan
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Gunakan promise wrapper untuk async/await
const promisePool = pool.promise();

// Test koneksi database
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // Stop aplikasi jika database error
  }
};

// Helper function untuk query dengan error handling
const query = async (sql, params = []) => {
  try {
    const [rows] = await promisePool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function untuk transaction
const transaction = async (callback) => {
  const connection = await promisePool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool: promisePool,
  testConnection,
  query,
  transaction
};