// src/index.js
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const resourceRoutes = require('./routes/resourceRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const errorHandler = require('./middleware/errorHandler');

/**
 * ==========================================
 * DEVELOPER RESOURCE HUB - BACKEND SERVER
 * ==========================================
 * 
 * Ứng dụng Express server chính (Supabase PostgreSQL)
 * - Kết nối PostgreSQL (Supabase)
 * - Cấu hình CORS
 * - Định nghĩa routes
 * - Global error handler
 */

const app = express();

// ==========================================
// 1. MIDDLEWARE SETUP
// ==========================================

// CORS - Cho phép frontend access API
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
connectDB();

// ==========================================
// 3. ROUTES
// ==========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running (PostgreSQL/Supabase)',
    timestamp: new Date().toISOString(),
  });
});

// Resource API routes
app.use('/api/resources', resourceRoutes);

// Auth API routes
app.use('/api/auth', authRoutes);

// Category API routes
app.use('/api/categories', categoryRoutes);

// Admin API routes
app.use('/api/admin', adminRoutes);

// ==========================================
// 4. 404 HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use(errorHandler);

// ==========================================
// 6. START SERVER
// ==========================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  Developer Resource Hub - Backend      ║
  ║  Server running on port ${PORT}         ║
  ║  Database: PostgreSQL (Supabase)       ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});
