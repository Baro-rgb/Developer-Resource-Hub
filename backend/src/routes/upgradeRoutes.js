const express = require('express');
const router = express.Router();
const { applyUpgradeCode, generateUpgradeCode, getUpgradeCodes } = require('../controllers/upgradeController');
const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');

router.post('/apply', authenticate, applyUpgradeCode);

// Admin only routes
router.get('/', authenticate, authorizeAdmin, getUpgradeCodes);
router.post('/generate', authenticate, authorizeAdmin, generateUpgradeCode);

module.exports = router;
