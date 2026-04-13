// src/middleware/validation.js
const Joi = require('joi');

/**
 * Validation schemas dùng Joi
 * Định nghĩa các rule validate cho từng request
 */

// Schema cho tạo/update resource
const resourceSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  category: Joi.string()
    .max(100)
    .optional()
    .allow(null, ''),
  subcategory: Joi.string().max(100).optional().allow(null, ''),
  url: Joi.string()
    .uri()
    .required(),
  technologies: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().max(1000).optional().allow(null, ''),
  notes: Joi.string().max(1000).optional().allow(null, ''),
  source: Joi.string()
    .valid('Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác')
    .optional()
    .allow(null, ''),
  lastUsedDate: Joi.date().optional().allow(null, ''),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(6).required(),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email({ tlds: { allow: false } }).optional(),
  is_admin: Joi.boolean().optional(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  key: Joi.string().min(2).max(100).required(),
  subcategories: Joi.array().items(Joi.string()).optional(),
  owner_id: Joi.number().integer().optional(),
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  key: Joi.string().min(2).max(100).optional(),
  subcategories: Joi.array().items(Joi.string()).optional(),
});

const bulkResourceItemSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  category: Joi.string().max(100).optional().allow(null, ''),
  subcategory: Joi.string().max(100).optional().allow(null, ''),
  url: Joi.string().uri().required(),
  technologies: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().max(1000).optional().allow(null, ''),
  notes: Joi.string().max(1000).optional().allow(null, ''),
  source: Joi.string()
    .valid('Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác')
    .optional()
    .allow(null, ''),
  lastUsedDate: Joi.date().optional().allow(null, ''),
});

const bulkCreateSchema = Joi.object({
  resources: Joi.array().items(bulkResourceItemSchema).min(1).max(200).required(),
});

const bulkDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const bulkUpdateSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  field: Joi.string().valid('category', 'subcategory', 'source').required(),
  value: Joi.any().allow('', null).required(),
  mode: Joi.string().valid('replace', 'fill').optional(),
});

/**
 * Validate request body
 * @param {Object} schema - Joi schema để validate
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const err = new Error('Validation Error');
      err.details = error.details;
      return next(err);
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateRequest,
  resourceSchema,
  registerSchema,
  loginSchema,
  userUpdateSchema,
  categorySchema,
  categoryUpdateSchema,
  bulkCreateSchema,
  bulkDeleteSchema,
  bulkUpdateSchema,
};
