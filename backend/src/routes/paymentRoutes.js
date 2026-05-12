const express = require('express');
const { createPaymentLink, checkPaymentStatus, handleWebhook } = require('../controllers/paymentController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-payment-link', authenticate, createPaymentLink);
router.get('/status/:orderCode', authenticate, checkPaymentStatus);
router.post('/webhook', handleWebhook);

module.exports = router;
