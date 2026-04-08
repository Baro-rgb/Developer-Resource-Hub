// src/config/database.js
const { Pool } = require('pg');

/**
 * Kết nối PostgreSQL qua Supabase
 * Sử dụng pg library để quản lý connection pool
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Cần cho Supabase
  },
});

// Test connection
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Connect khi app start
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL (Supabase) connected successfully');
    client.release();

    // Run migrations
    console.log('🔄 Running database migrations...');
    const { runMigrations } = require('../utils/migrations');
    await runMigrations();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
