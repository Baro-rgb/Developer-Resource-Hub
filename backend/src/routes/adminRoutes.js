// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, getAllResources, getResourceById, updateResource, deleteResource } = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');
const { validateRequest, userUpdateSchema } = require('../middleware/validation');

router.use(authenticate, authorizeAdmin);

router.get('/users', getUsers);
router.put('/users/:id', validateRequest(userUpdateSchema), updateUser);
router.delete('/users/:id', deleteUser);

router.get('/resources', getAllResources);
router.get('/resources/:id', getResourceById);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

module.exports = router;
