// src/index.js
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const resourceRoutes = require('./routes/resourceRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const shareRoutes = require('./routes/shareRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
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
const isProduction = process.env.NODE_ENV === 'production';
const requiredInAllEnv = ['DATABASE_URL'];
const requiredInProductionOnly = ['JWT_SECRET'];

const missingAlways = requiredInAllEnv.filter((key) => !process.env[key]);
const missingProdOnly = requiredInProductionOnly.filter((key) => !process.env[key]);

if (missingAlways.length > 0) {
  const message = `❌ Missing required environment variables: ${missingAlways.join(', ')}`;
  throw new Error(message);
}

if (isProduction && missingProdOnly.length > 0) {
  const message = `❌ Missing required environment variables: ${missingProdOnly.join(', ')}`;
  throw new Error(message);
}

if (!isProduction && missingProdOnly.includes('JWT_SECRET')) {
  console.warn('⚠️ JWT_SECRET is not set. Using development fallback secret.');
}

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// ==========================================
// 1. MIDDLEWARE SETUP
// ==========================================

// CORS - Cho phép frontend access API
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
  helmet({
    contentSecurityPolicy: false, // API-only backend; avoid CSP conflicts in current setup
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

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

const globalApiLimiter = rateLimit({
  windowMs: toPositiveInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  limit: toPositiveInt(process.env.GLOBAL_RATE_LIMIT_MAX, 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running (PostgreSQL/Supabase)',
    timestamp: new Date().toISOString(),
  });
});

// Global API rate limit (excluding health endpoint above)
app.use('/api', globalApiLimiter);

// Resource API routes
app.use('/api/resources', resourceRoutes);

// Auth API routes
app.use('/api/auth', authRoutes);

// Category API routes
app.use('/api/categories', categoryRoutes);

// Admin API routes
app.use('/api/admin', adminRoutes);

// Share API routes
app.use('/api/shares', shareRoutes);

// Notification API routes
app.use('/api/notifications', notificationRoutes);

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
