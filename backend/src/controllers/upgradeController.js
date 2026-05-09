const { pool } = require('../config/database');

const applyUpgradeCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Mã nâng cấp không được bỏ trống' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Check if code exists and is unused
      const codeQuery = await client.query('SELECT * FROM upgrade_codes WHERE code = $1 FOR UPDATE', [code]);
      const upgradeCode = codeQuery.rows[0];

      if (!upgradeCode) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Mã nâng cấp không hợp lệ' });
      }

      if (upgradeCode.is_used) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Mã nâng cấp đã được sử dụng' });
      }

      // 2. Apply upgrade to user
      await client.query(
        'UPDATE users SET subscription_plan = $1 WHERE id = $2',
        [upgradeCode.plan_type, userId]
      );

      // 3. Mark code as used
      await client.query(
        'UPDATE upgrade_codes SET is_used = true, used_by = $1, used_at = NOW() WHERE id = $2',
        [userId, upgradeCode.id]
      );

      await client.query('COMMIT');
      res.json({ 
        success: true, 
        message: `Nâng cấp thành công lên gói ${upgradeCode.plan_type.toUpperCase()}!`,
        plan: upgradeCode.plan_type 
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

const generateUpgradeCode = async (req, res, next) => {
  try {
    const { planType = 'pro', count = 1 } = req.body;
    
    // Generate simple readable codes like PRO-1234-ABCD
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = `${planType.toUpperCase()}-`;
      for(let i=0; i<4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      code += '-';
      for(let i=0; i<4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      return code;
    };

    const codes = [];
    for(let i=0; i<count; i++) {
      codes.push(generateCode());
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertedCodes = [];
      
      for(const code of codes) {
        const result = await client.query(
          'INSERT INTO upgrade_codes (code, plan_type) VALUES ($1, $2) RETURNING id, code, plan_type, is_used, created_at',
          [code, planType]
        );
        insertedCodes.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json({ success: true, data: insertedCodes });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

const getUpgradeCodes = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.email as used_by_email 
      FROM upgrade_codes c 
      LEFT JOIN users u ON c.used_by = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyUpgradeCode,
  generateUpgradeCode,
  getUpgradeCodes
};
