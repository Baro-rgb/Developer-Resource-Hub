// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');
const { checkCategoryQuota } = require('../middleware/quotaMiddleware');
const { validateRequest, categorySchema, categoryUpdateSchema } = require('../middleware/validation');

router.get('/', authenticate, getCategories);

router.post('/', authenticate, checkCategoryQuota, validateRequest(categorySchema), createCategory);
router.put('/:id', authenticate, validateRequest(categoryUpdateSchema), updateCategory);
router.delete('/:id', authenticate, deleteCategory);

module.exports = router;
