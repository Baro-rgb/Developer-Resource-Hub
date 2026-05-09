const test = require('node:test');
const assert = require('node:assert/strict');

const { pool } = require('../src/config/database');
const { ensureResourceQuota } = require('../src/middleware/quotaMiddleware');

test('ensureResourceQuota allows admin without quota checks', async () => {
  await assert.doesNotReject(() =>
    ensureResourceQuota({ id: 1, isAdmin: true }, 50)
  );
});

test('ensureResourceQuota blocks free users exceeding remaining slots', async () => {
  const originalQuery = pool.query;
  pool.query = async (sql) => {
    if (sql.includes('SELECT subscription_plan')) {
      return { rows: [{ subscription_plan: 'free' }] };
    }
    if (sql.includes('SELECT COUNT(*) FROM resources')) {
      return { rows: [{ count: '29' }] };
    }
    return { rows: [] };
  };

  await assert.rejects(
    () => ensureResourceQuota({ id: 100, isAdmin: false }, 2),
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'QUOTA_EXCEEDED');
      return true;
    }
  );

  pool.query = originalQuery;
});
