// src/routes/shareRoutes.js
const express = require('express');
const router = express.Router();
const { generateLink, previewLink, importLink } = require('../controllers/shareController');
const authenticate = require('../middleware/authMiddleware');

// Lấy thông tin tài nguyên từ token chia sẻ (không cần đăng nhập)
router.get('/preview/:token', previewLink);

// Tạo link chia sẻ (cần đăng nhập)
router.post('/generate', authenticate, generateLink);

// Import tài nguyên từ link vào kho (cần đăng nhập)
router.post('/import/:token', authenticate, importLink);

module.exports = router;
