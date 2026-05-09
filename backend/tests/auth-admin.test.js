const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_jwt_secret';

const authenticate = require('../src/middleware/authMiddleware');
const authorizeAdmin = require('../src/middleware/adminMiddleware');

test('authenticate sets req.user for valid token', async () => {
  const token = jwt.sign({ id: 1, email: 'test@example.com', isAdmin: true }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = {};
  let nextCalled = false;

  authenticate(req, res, (err) => {
    assert.equal(err, undefined);
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 1);
  assert.equal(req.user.isAdmin, true);
});

test('authenticate rejects invalid token', async () => {
  const req = { headers: { authorization: 'Bearer invalid-token' } };
  const res = {};
  let capturedErr;

  authenticate(req, res, (err) => {
    capturedErr = err;
  });

  assert.ok(capturedErr);
  assert.equal(capturedErr.statusCode, 401);
});

test('authorizeAdmin rejects non-admin users', async () => {
  const req = { user: { isAdmin: false } };
  const res = {};
  let capturedErr;

  authorizeAdmin(req, res, (err) => {
    capturedErr = err;
  });

  assert.ok(capturedErr);
  assert.equal(capturedErr.statusCode, 403);
});
