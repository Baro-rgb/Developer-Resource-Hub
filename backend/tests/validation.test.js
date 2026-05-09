const test = require('node:test');
const assert = require('node:assert/strict');

const {
  bulkCreateSchema,
  notificationSendSchema,
  upgradeApplySchema,
  adminResourceUpdateSchema,
} = require('../src/middleware/validation');

test('bulkCreateSchema rejects empty resources array', async () => {
  const { error } = bulkCreateSchema.validate({ resources: [] });
  assert.ok(error);
});

test('notificationSendSchema validates recipient email and resource id', async () => {
  const ok = notificationSendSchema.validate({
    recipient_email: 'receiver@example.com',
    resource_id: 10,
  });
  assert.equal(ok.error, undefined);
});

test('upgradeApplySchema requires non-empty code', async () => {
  const bad = upgradeApplySchema.validate({ code: '' });
  assert.ok(bad.error);
});

test('adminResourceUpdateSchema accepts partial update payload', async () => {
  const payload = { title: 'Updated title', source: 'GitHub' };
  const { error } = adminResourceUpdateSchema.validate(payload);
  assert.equal(error, undefined);
});
