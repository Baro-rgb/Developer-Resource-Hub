// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController');
const { validateRequest, registerSchema, loginSchema } = require('../middleware/validation');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, profile);

module.exports = router;