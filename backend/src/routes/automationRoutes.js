// src/routes/automationRoutes.js
const express = require('express');
const router = express.Router();
const { fetchMeta } = require('../controllers/automationController');
const authenticate = require('../middleware/authMiddleware');

// Chỉ cho phép user đã đăng nhập dùng tính năng cào dữ liệu (để tránh bị abuse API)
router.use(authenticate);

// Cào dữ liệu web (Phase 1 & 2)
router.post('/fetch-meta', fetchMeta);

module.exports = router;
