// src/controllers/resourceController.js
const { pool } = require('../config/database');

/**
 * Resource Controller - SQL Version
 * Xử lý tất cả business logic cho resource
 * Bao gồm: CRUD, search, filter
 */

// GET /resources - Lấy danh sách resources với search, filter, pagination
const getAllResources = async (req, res, next) => {
  try {
    const { search, category, subcategory, source, page = 1, limit = 10 } = req.query;
    const ownerId = req.user.id;

    // Tạo SQL query với owner_id
    let query = 'SELECT * FROM resources WHERE owner_id = $1';
    let params = [ownerId];
    let paramCount = 2;

    // 1. Search by substring on title and description
    if (search) {
      query += ` AND (
        title ILIKE '%' || $${paramCount} || '%' OR
        description ILIKE '%' || $${paramCount} || '%'
      )`;
      params.push(search);
      paramCount++;
    }

    // 2. Filter by category
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // 3. Filter by subcategory
    if (subcategory) {
      query += ` AND subcategory = $${paramCount}`;
      params.push(subcategory);
      paramCount++;
    }

    // 4. Filter by source
    if (source) {
      query += ` AND source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }

    // Lấy tổng số resources
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as count'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Tính pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Lấy resources với sort, pagination
    const finalQuery = query + ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(finalQuery, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /resources/:id - Lấy chi tiết một resource
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const result = await pool.query('SELECT * FROM resources WHERE id = $1 AND owner_id = $2', [id, ownerId]);

    if (result.rows.length === 0) {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// POST /resources - Tạo resource mới
const createResource = async (req, res, next) => {
  try {
    const { title, category, subcategory, url, technologies, description, notes, source, lastUsedDate } = req.body;

    if (!title || !url) {
      const err = new Error('Title and URL are required');
      err.statusCode = 400;
      return next(err);
    }

    const query = `
      INSERT INTO resources (owner_id, title, category, subcategory, url, technologies, description, notes, source, last_used_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const params = [
      req.user.id,
      title,
      category || null,
      subcategory || null,
      url,
      technologies || [],
      description || null,
      notes || null,
      source || null,
      lastUsedDate || null,
    ];

    const result = await pool.query(query, params);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// PUT /resources/:id - Update resource
const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, subcategory, url, technologies, description, notes, source, lastUsedDate } = req.body;

    // Tạo dynamic update query
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

    // Thêm updated_at
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      // Chỉ updated_at, không update gì khác
      const err = new Error('No fields to update');
      err.statusCode = 400;
      return next(err);
    }

    const query = `UPDATE resources SET ${updates.join(', ')} WHERE id = $${paramCount} AND owner_id = $${paramCount + 1} RETURNING *`;
    params.push(id, req.user.id);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /resources/:id - Xóa resource
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM resources WHERE id = $1 AND owner_id = $2 RETURNING *', [id, req.user.id]);

    if (result.rows.length === 0) {
      const err = new Error('Resource not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// GET /resources/sources - Lấy danh sách tất cả sources
const getSources = async (req, res, next) => {
  try {
    const sources = ['Tiktok', 'YouTube', 'Facebook', 'Twitter', 'Blog', 'GitHub', 'Khác'];

    res.json({
      success: true,
      data: sources,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getSources,
};
