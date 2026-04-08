// src/controllers/categoryController.js
const { pool } = require('../config/database');

const getCategories = async (req, res, next) => {
  try {
    const ownerId = req.user.isAdmin && req.query.ownerId ? parseInt(req.query.ownerId, 10) : req.user.id;
    
    if (req.query.page || req.query.limit) {
      const page = req.query.page ? Math.max(parseInt(req.query.page, 10) || 1, 1) : 1;
      const limit = req.query.limit ? Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100) : 10;
      const offset = (page - 1) * limit;

      const countResult = await pool.query('SELECT COUNT(*) FROM categories WHERE owner_id = $1', [ownerId]);
      const total = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(total / limit) || 1;

      const result = await pool.query(
        'SELECT id, owner_id, name, key, subcategories FROM categories WHERE owner_id = $1 ORDER BY name LIMIT $2 OFFSET $3',
        [ownerId, limit, offset]
      );
      res.json({ success: true, data: result.rows, pagination: { page, limit, total, totalPages } });
    } else {
      const result = await pool.query(
        'SELECT id, owner_id, name, key, subcategories FROM categories WHERE owner_id = $1 ORDER BY name',
        [ownerId]
      );
      res.json({ success: true, data: result.rows });
    }
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, key, subcategories, owner_id } = req.body;
    const categoryOwnerId = req.user.isAdmin && owner_id ? parseInt(owner_id, 10) : req.user.id;
    const result = await pool.query(
      'INSERT INTO categories (owner_id, name, key, subcategories) VALUES ($1, $2, $3, $4) RETURNING id, owner_id, name, key, subcategories',
      [categoryOwnerId, name, key, JSON.stringify(subcategories || [])]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, key, subcategories } = req.body;

    const updates = [];
    const params = [];
    let index = 1;

    if (name !== undefined) {
      updates.push(`name = $${index++}`);
      params.push(name);
    }
    if (key !== undefined) {
      updates.push(`key = $${index++}`);
      params.push(key);
    }
    if (subcategories !== undefined) {
      updates.push(`subcategories = $${index++}`);
      params.push(JSON.stringify(subcategories));
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      const err = new Error('No fields to update');
      err.statusCode = 400;
      return next(err);
    }

    const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = $${index} RETURNING id, name, key, subcategories`;
    params.push(id);

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id, name, key', [id]);

    if (result.rows.length === 0) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
