// src/middleware/quotaMiddleware.js
const { pool } = require('../config/database');

const FREE_RESOURCE_LIMIT = 30;
const FREE_CATEGORY_LIMIT = 5;

const getUserPlan = async (userId) => {
  const userQuery = await pool.query('SELECT subscription_plan FROM users WHERE id = $1', [userId]);
  const user = userQuery.rows[0];
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user.subscription_plan;
};

const ensureResourceQuota = async (user, createCount = 1) => {
  if (!user || !user.id) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  // Admin or pro users are unlimited
  if (user.isAdmin) return;
  const plan = await getUserPlan(user.id);
  if (plan === 'pro') return;

  const countQuery = await pool.query('SELECT COUNT(*) FROM resources WHERE owner_id = $1', [user.id]);
  const currentCount = parseInt(countQuery.rows[0].count, 10);
  const availableSlots = Math.max(0, FREE_RESOURCE_LIMIT - currentCount);

  if (createCount > availableSlots) {
    const err = new Error(
      `Đã đạt giới hạn tài nguyên của gói Free (${currentCount}/${FREE_RESOURCE_LIMIT}). Bạn chỉ còn ${availableSlots} slot trống, không đủ để thêm ${createCount} tài nguyên. Vui lòng nâng cấp lên gói Pro để lưu trữ không giới hạn!`
    );
    err.statusCode = 403;
    err.code = 'QUOTA_EXCEEDED';
    throw err;
  }
};

const checkResourceQuota = async (req, res, next) => {
  try {
    await ensureResourceQuota(req.user, 1);
    next();
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }
    next(error);
  }
};

const checkBulkResourceQuota = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.resources) ? req.body.resources : [];
    const createCount = items.length;
    await ensureResourceQuota(req.user, createCount);
    next();
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
      });
    }
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
  checkBulkResourceQuota,
  checkCategoryQuota,
  ensureResourceQuota,
};
