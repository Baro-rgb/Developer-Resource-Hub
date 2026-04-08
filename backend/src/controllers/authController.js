// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'resourcehub_secret';
const JWT_EXPIRES_IN = '7d';

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.is_admin || false },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const err = new Error('Email đã được sử dụng');
      err.statusCode = 400;
      return next(err);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin, created_at`,
      [name || 'User', email, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      const err = new Error('Email hoặc mật khẩu không chính xác');
      err.statusCode = 401;
      return next(err);
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const err = new Error('Email hoặc mật khẩu không chính xác');
      err.statusCode = 401;
      return next(err);
    }

    const token = createToken(user);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error('Unauthorized');
      err.statusCode = 401;
      return next(err);
    }

    const result = await pool.query('SELECT id, name, email, is_admin, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      const err = new Error('User not found');
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

module.exports = {
  register,
  login,
  profile,
};