// src/middleware/adminMiddleware.js

const authorizeAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    const err = new Error('Forbidden: Admin access required');
    err.statusCode = 403;
    return next(err);
  }
  next();
};

module.exports = authorizeAdmin;
