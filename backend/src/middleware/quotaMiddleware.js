// src/middleware/quotaMiddleware.js
const { pool } = require('../config/database');

const checkResourceQuota = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Admin is unlimited
    if (req.user.isAdmin) return next();

    const userQuery = await pool.query('SELECT subscription_plan FROM users WHERE id = $1', [userId]);
    const user = userQuery.rows[0];

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.subscription_plan === 'pro') return next(); // Unlimited

    // Free tier limit: 30 resources
    const FREE_RESOURCE_LIMIT = 30;

    const countQuery = await pool.query('SELECT COUNT(*) FROM resources WHERE owner_id = $1', [userId]);
    const currentCount = parseInt(countQuery.rows[0].count, 10);

    if (currentCount >= FREE_RESOURCE_LIMIT) {
      return res.status(403).json({ 
        success: false, 
        message: 'Đã đạt giới hạn tài nguyên của gói Free (30/30). Vui lòng nâng cấp lên gói Pro để lưu trữ không giới hạn!',
        code: 'QUOTA_EXCEEDED'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

const checkCategoryQuota = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Admin is unlimited
    if (req.user.isAdmin) return next();

    const userQuery = await pool.query('SELECT subscription_plan FROM users WHERE id = $1', [userId]);
    const user = userQuery.rows[0];

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.subscription_plan === 'pro') return next(); // Unlimited

    // Free tier limit: 5 categories
    const FREE_CATEGORY_LIMIT = 5;

    const countQuery = await pool.query('SELECT COUNT(*) FROM categories WHERE owner_id = $1', [userId]);
    const currentCount = parseInt(countQuery.rows[0].count, 10);

    if (currentCount >= FREE_CATEGORY_LIMIT) {
      return res.status(403).json({ 
        success: false, 
        message: 'Đã đạt giới hạn danh mục của gói Free (5/5). Vui lòng nâng cấp lên gói Pro để tạo không giới hạn!',
        code: 'QUOTA_EXCEEDED'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkResourceQuota,
  checkCategoryQuota
};
