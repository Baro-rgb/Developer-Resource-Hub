// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { sendNotification, getNotifications, respondToNotification } = require('../controllers/notificationController');
const authenticate = require('../middleware/authMiddleware');

// Tất cả thao tác thông báo đều cần đăng nhập
router.use(authenticate);

// Lấy danh sách thông báo chưa đọc (pending)
router.get('/', getNotifications);

// Gửi tài nguyên cho User khác (qua Email)
router.post('/send', sendNotification);

// Trả lời thông báo (accept/reject)
router.post('/:id/respond', respondToNotification);

module.exports = router;
