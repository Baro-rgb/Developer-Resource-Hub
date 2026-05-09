// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getAllResources, getResourceById, updateResource, deleteResource } = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');
const { validateRequest, validateParams, userUpdateSchema, adminResourceUpdateSchema, idParamSchema } = require('../middleware/validation');

router.use(authenticate, authorizeAdmin);

router.get('/users', getUsers);
router.put('/users/:id', validateParams(idParamSchema), validateRequest(userUpdateSchema), updateUser);
router.delete('/users/:id', validateParams(idParamSchema), deleteUser);

router.get('/resources', getAllResources);
router.get('/resources/:id', validateParams(idParamSchema), getResourceById);
router.put('/resources/:id', validateParams(idParamSchema), validateRequest(adminResourceUpdateSchema), updateResource);
router.delete('/resources/:id', validateParams(idParamSchema), deleteResource);

module.exports = router;
