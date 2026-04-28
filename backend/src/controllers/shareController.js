// src/controllers/shareController.js
const crypto = require('crypto');
const { pool } = require('../config/database');

const generateLink = async (req, res, next) => {
  try {
    const { resource_id } = req.body;
    const user_id = req.user.id;

    // Verify ownership
    const resourceResult = await pool.query('SELECT id FROM resources WHERE id = $1 AND owner_id = $2', [resource_id, user_id]);
    if (resourceResult.rows.length === 0) {
      const err = new Error('Resource not found or unauthorized');
      err.statusCode = 404;
      return next(err);
    }

    // Generate unique token
    const token = crypto.randomBytes(8).toString('hex');

    // Save to shared_links
    await pool.query(
      'INSERT INTO shared_links (resource_id, share_token, created_by) VALUES ($1, $2, $3)',
      [resource_id, token, user_id]
    );

    res.json({
      success: true,
      data: { token, link: `/shared/${token}` }
    });
  } catch (error) {
    next(error);
  }
};

const previewLink = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Get link info
    const linkResult = await pool.query(
      'SELECT resource_id FROM shared_links WHERE share_token = $1',
      [token]
    );

    if (linkResult.rows.length === 0) {
      const err = new Error('Invalid or expired share link');
      err.statusCode = 404;
      return next(err);
    }

    // Get resource details
    const resourceResult = await pool.query(
      'SELECT id, title, url, description, technologies, category, subcategory, source FROM resources WHERE id = $1',
      [linkResult.rows[0].resource_id]
    );

    if (resourceResult.rows.length === 0) {
      const err = new Error('Shared resource no longer exists');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      data: resourceResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const importLink = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user_id = req.user.id;

    // Get link info
    const linkResult = await pool.query(
      'SELECT resource_id FROM shared_links WHERE share_token = $1',
      [token]
    );

    if (linkResult.rows.length === 0) {
      const err = new Error('Invalid or expired share link');
      err.statusCode = 404;
      return next(err);
    }

    // Get resource details
    const resourceResult = await pool.query(
      'SELECT title, url, description, technologies, notes, category, subcategory, source FROM resources WHERE id = $1',
      [linkResult.rows[0].resource_id]
    );

    if (resourceResult.rows.length === 0) {
      const err = new Error('Shared resource no longer exists');
      err.statusCode = 404;
      return next(err);
    }

    const r = resourceResult.rows[0];

    // Copy resource to new owner
    const insertResult = await pool.query(
      `INSERT INTO resources 
        (title, url, description, technologies, notes, category, subcategory, source, owner_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [r.title, r.url, r.description, r.technologies, r.notes, r.category, r.subcategory, r.source, user_id]
    );

    res.json({
      success: true,
      data: insertResult.rows[0],
      message: 'Resource imported successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateLink,
  previewLink,
  importLink
};
