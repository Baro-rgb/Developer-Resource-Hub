// src/controllers/notificationController.js
const { pool } = require('../config/database');

const sendNotification = async (req, res, next) => {
  try {
    const { recipient_email, resource_id } = req.body;
    const sender_id = req.user.id;

    // Verify ownership of resource
    const resourceResult = await pool.query('SELECT id FROM resources WHERE id = $1 AND owner_id = $2', [resource_id, sender_id]);
    if (resourceResult.rows.length === 0) {
      const err = new Error('Resource not found or unauthorized');
      err.statusCode = 404;
      return next(err);
    }

    // Find recipient by email
    const recipientResult = await pool.query('SELECT id FROM users WHERE email = $1', [recipient_email]);
    if (recipientResult.rows.length === 0) {
      const err = new Error('Recipient email not found');
      err.statusCode = 404;
      return next(err);
    }

    const recipient_id = recipientResult.rows[0].id;

    if (recipient_id === sender_id) {
      const err = new Error('Cannot share with yourself');
      err.statusCode = 400;
      return next(err);
    }

    // Create notification
    await pool.query(
      'INSERT INTO notifications (recipient_id, sender_id, resource_id) VALUES ($1, $2, $3)',
      [recipient_id, sender_id, resource_id]
    );

    res.json({
      success: true,
      message: 'Resource shared successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(`
      SELECT n.id, n.status, n.created_at, 
             u.name as sender_name, u.email as sender_email,
             r.title as resource_title
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      JOIN resources r ON n.resource_id = r.id
      WHERE n.recipient_id = $1 AND n.status = 'pending'
      ORDER BY n.created_at DESC
    `, [user_id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

const respondToNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const user_id = req.user.id;

    // Check notification
    const notifResult = await pool.query(
      'SELECT resource_id FROM notifications WHERE id = $1 AND recipient_id = $2 AND status = $3',
      [id, user_id, 'pending']
    );

    if (notifResult.rows.length === 0) {
      const err = new Error('Notification not found or already processed');
      err.statusCode = 404;
      return next(err);
    }

    if (action === 'reject') {
      await pool.query('UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2', ['rejected', id]);
      return res.json({ success: true, message: 'Share rejected' });
    }

    if (action === 'accept') {
      const resource_id = notifResult.rows[0].resource_id;

      // Get resource details
      const resourceResult = await pool.query(
        'SELECT title, url, description, technologies, notes, category, subcategory, source FROM resources WHERE id = $1',
        [resource_id]
      );

      if (resourceResult.rows.length > 0) {
        const r = resourceResult.rows[0];
        // Copy resource
        await pool.query(
          `INSERT INTO resources 
            (title, url, description, technologies, notes, category, subcategory, source, owner_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [r.title, r.url, r.description, r.technologies, r.notes, r.category, r.subcategory, r.source, user_id]
        );
      }

      await pool.query('UPDATE notifications SET status = $1, updated_at = NOW() WHERE id = $2', ['accepted', id]);
      return res.json({ success: true, message: 'Resource imported successfully' });
    }

    const err = new Error('Invalid action');
    err.statusCode = 400;
    return next(err);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotification,
  getNotifications,
  respondToNotification
};
