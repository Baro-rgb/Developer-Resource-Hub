// src/middleware/errorHandler.js

/**
 * Error Handler Middleware
 * Xử lý tất cả các errors từ routes
 * Trả về response lỗi chuẩn
 */
const errorHandler = (err, req, res, next) => {
  // Mặc định error status là 500
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Xử lý Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = 'Validation Error';
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  // Xử lý Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
    return res.status(statusCode).json({
      success: false,
      message,
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // Xử lý Joi validation error
  if (err.details) {
    statusCode = 400;
    const errors = err.details.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Trả về error response
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
