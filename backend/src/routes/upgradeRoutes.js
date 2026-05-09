const express = require('express');
const router = express.Router();
const { applyUpgradeCode, generateUpgradeCode, getUpgradeCodes } = require('../controllers/upgradeController');
const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');
const { validateRequest, upgradeApplySchema, upgradeGenerateSchema } = require('../middleware/validation');

router.post('/apply', authenticate, validateRequest(upgradeApplySchema), applyUpgradeCode);

// Admin only routes
router.get('/', authenticate, authorizeAdmin, getUpgradeCodes);
router.post('/generate', authenticate, authorizeAdmin, validateRequest(upgradeGenerateSchema), generateUpgradeCode);

module.exports = router;
