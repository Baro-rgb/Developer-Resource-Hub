// src/controllers/adminController.js
const { pool } = require('../config/database');

const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const result = await pool.query(
      'SELECT id, name, email, is_admin, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, is_admin } = req.body;

    if (!name && !email && is_admin === undefined) {
      const err = new Error('No fields to update');
      err.statusCode = 400;
      return next(err);
    }

    if (parseInt(id, 10) === req.user.id && is_admin === false) {
      const err = new Error('Cannot remove admin role from the current user');
      err.statusCode = 403;
      return next(err);
    }

    const updates = [];
    const params = [];
    let index = 1;

    if (name !== undefined) {
      updates.push(`name = $${index++}`);
      params.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${index++}`);
      params.push(email);
    }
    if (is_admin !== undefined) {
      updates.push(`is_admin = $${index++}`);
      params.push(is_admin);
    }

    updates.push(`updated_at = NOW()`);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${index} RETURNING id, name, email, is_admin, created_at, updated_at`;
    params.push(id);

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      const err = new Error('Cannot delete the current admin user');
      err.statusCode = 403;
      return next(err);
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
      [id]
    );

    if (result.rows.length === 0) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getAllResources = async (req, res, next) => {
  try {
    const ownerId = req.query.ownerId ? parseInt(req.query.ownerId, 10) : null;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const whereClause = ownerId ? 'WHERE r.owner_id = $1' : '';
    const params = ownerId ? [ownerId] : [];

    const countResult = await pool.query(`SELECT COUNT(*) AS count FROM resources r ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const query = `
      SELECT r.*, u.name AS owner_name, u.email AS owner_email
      FROM resources r
      JOIN users u ON r.owner_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const result = await pool.query(query, [...params, limit, offset]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT r.*, u.name AS owner_name, u.email AS owner_email FROM resources r JOIN users u ON r.owner_id = u.id WHERE r.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, subcategory, url, technologies, description, notes, source, lastUsedDate } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      params.push(title);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      params.push(category);
    }
    if (subcategory !== undefined) {
      updates.push(`subcategory = $${paramCount++}`);
      params.push(subcategory);
    }
    if (url !== undefined) {
      updates.push(`url = $${paramCount++}`);
      params.push(url);
    }
    if (technologies !== undefined) {
      updates.push(`technologies = $${paramCount++}`);
      params.push(technologies);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      params.push(notes);
    }
    if (source !== undefined) {
      updates.push(`source = $${paramCount++}`);
      params.push(source);
    }
    if (lastUsedDate !== undefined) {
      updates.push(`last_used_date = $${paramCount++}`);
      params.push(lastUsedDate);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      const err = new Error('No fields to update');
      err.statusCode = 400;
      return next(err);
    }

    const query = `UPDATE resources SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
};
