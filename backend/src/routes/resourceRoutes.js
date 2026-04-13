// src/routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourceById,
  createResource,
  bulkCreateResources,
  bulkUpdateResources,
  bulkDeleteResources,
  updateResource,
  deleteResource,
  getSources,
} = require('../controllers/resourceController');
const {
  validateRequest,
  resourceSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
} = require('../middleware/validation');
const authenticate = require('../middleware/authMiddleware');

/**
 * Resource Routes
 * Định nghĩa tất cả endpoints cho resource management
 */

// Protected resource routes
router.use(authenticate);

// GET /api/resources/sources - Lấy danh sách sources
router.get('/sources', getSources);

// GET /api/resources - Lấy danh sách resources với search & filter
router.get('/', getAllResources);

// GET /api/resources/:id - Lấy chi tiết resource
router.get('/:id', getResourceById);

router.post('/bulk', validateRequest(bulkCreateSchema), bulkCreateResources);
router.patch('/bulk', validateRequest(bulkUpdateSchema), bulkUpdateResources);
router.delete('/bulk', validateRequest(bulkDeleteSchema), bulkDeleteResources);
router.post('/', validateRequest(resourceSchema), createResource);
router.put('/:id', validateRequest(resourceSchema), updateResource);
router.delete('/:id', deleteResource);

module.exports = router;
