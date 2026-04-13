// src/routes/authRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController');
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validation');
const authenticate = require('../middleware/authMiddleware');

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const authWindowMs = toPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const loginLimit = toPositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT, 12);
const registerLimit = toPositiveInt(process.env.AUTH_REGISTER_RATE_LIMIT, 6);

const loginLimiter = rateLimit({
  windowMs: authWindowMs,
  limit: loginLimit,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
});

const registerLimiter = rateLimit({
  windowMs: authWindowMs,
  limit: registerLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.',
  },
});

router.post('/register', registerLimiter, validateRequest(registerSchema), register);
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.get('/me', authenticate, profile);

module.exports = router;