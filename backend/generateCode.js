// scripts/generateCode.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const run = async () => {
  const code = 'PRO-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  try {
    const res = await pool.query(
      "INSERT INTO upgrade_codes (code, plan_type) VALUES ($1, 'pro') RETURNING *",
      [code]
    );
    console.log('✅ Generated PRO Upgrade Code:', res.rows[0].code);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
