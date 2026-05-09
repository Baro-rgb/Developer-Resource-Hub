// src/routes/shareRoutes.js
const express = require('express');
const router = express.Router();
const { generateLink, previewLink, importLink } = require('../controllers/shareController');
const authenticate = require('../middleware/authMiddleware');
const { validateRequest, validateParams, shareGenerateSchema, tokenParamSchema } = require('../middleware/validation');

// Lấy thông tin tài nguyên từ token chia sẻ (không cần đăng nhập)
router.get('/preview/:token', validateParams(tokenParamSchema), previewLink);

// Tạo link chia sẻ (cần đăng nhập)
router.post('/generate', authenticate, validateRequest(shareGenerateSchema), generateLink);

// Import tài nguyên từ link vào kho (cần đăng nhập)
router.post('/import/:token', authenticate, validateParams(tokenParamSchema), importLink);

module.exports = router;
