// backend/src/utils/migrations.js
/**
 * Database Migrations Utility
 * Run migrations to update database schema
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const migrations = [
  {
    id: '001_add_category_subcategory',
    description: 'Add category and subcategory columns to resources table',
    up: async () => {
      const client = await pool.connect();
      try {
        // Add category column
        await client.query(`
          ALTER TABLE resources 
          ADD COLUMN IF NOT EXISTS category VARCHAR(50)
        `);

        // Add subcategory column
        await client.query(`
          ALTER TABLE resources 
          ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)
        `);

        // Create indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category)
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_resources_subcategory ON resources(subcategory)
        `);

        console.log('✅ Migration 001 completed: Added category and subcategory columns');
        return true;
      } catch (error) {
        console.error('❌ Migration 001 failed:', error.message);
        throw error;
      } finally {
        client.release();
      }
    },
  },
  {
    id: '002_create_users_and_owner_id',
    description: 'Create users table and associate existing resources to a main account',
    up: async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);

        await client.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
        `);

        await client.query(`
          ALTER TABLE resources
          ADD COLUMN IF NOT EXISTS owner_id INTEGER
        `);

        const isProduction = process.env.NODE_ENV === 'production';
        const defaultMainEmail = process.env.DEFAULT_MAIN_ACCOUNT_EMAIL || 'main@resourcehub.local';
        const defaultMainPassword = process.env.DEFAULT_MAIN_ACCOUNT_PASSWORD || 'ResourceHub123!';
        const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@resourcehub.local';
        const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'AdminResource123!';

        if (
          isProduction &&
          (
            !process.env.DEFAULT_MAIN_ACCOUNT_PASSWORD ||
            !process.env.DEFAULT_ADMIN_PASSWORD ||
            defaultMainPassword === 'ResourceHub123!' ||
            defaultAdminPassword === 'AdminResource123!'
          )
        ) {
          throw new Error('Production requires strong DEFAULT_MAIN_ACCOUNT_PASSWORD and DEFAULT_ADMIN_PASSWORD env vars');
        }
        const mainPasswordHash = await bcrypt.hash(defaultMainPassword, 10);
        const adminPasswordHash = await bcrypt.hash(defaultAdminPassword, 10);

        const existingAdminResult = await client.query('SELECT id FROM users WHERE email = $1', [defaultAdminEmail]);
        if (existingAdminResult.rows.length === 0) {
          await client.query(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, TRUE)',
            ['Admin', defaultAdminEmail, adminPasswordHash]
          );
          console.log(`✅ Created default admin account: ${defaultAdminEmail}`);
        }

        const existingUserResult = await client.query('SELECT id FROM users WHERE email = $1', [defaultMainEmail]);
        let ownerId;

        if (existingUserResult.rows.length > 0) {
          ownerId = existingUserResult.rows[0].id;
        } else {
          const insertUserResult = await client.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            ['Main Account', defaultMainEmail, mainPasswordHash]
          );
          ownerId = insertUserResult.rows[0].id;
          console.log(`✅ Created default main account: ${defaultMainEmail}`);
        }

        await client.query('UPDATE resources SET owner_id = $1 WHERE owner_id IS NULL', [ownerId]);
        await client.query('ALTER TABLE resources ALTER COLUMN owner_id SET NOT NULL');

        console.log('✅ Migration 002 completed: Created users table and assigned existing resources to the main account');
        return true;
      } catch (error) {
        console.error('❌ Migration 002 failed:', error.message);
        throw error;
      } finally {
        client.release();
      }
    },
  },
  {
    id: '003_create_categories',
    description: 'Create categories table and seed default categories',
    up: async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER,
            name VARCHAR(100) NOT NULL,
            key VARCHAR(100) NOT NULL,
            subcategories JSONB NOT NULL DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `);

        await client.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS owner_id INTEGER');
        await client.query('ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_key_key');
        await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_owner_key ON categories(owner_id, key)');

        const defaultMainEmail = process.env.DEFAULT_MAIN_ACCOUNT_EMAIL || 'main@resourcehub.local';
        const mainAccountResult = await client.query('SELECT id FROM users WHERE email = $1', [defaultMainEmail]);
        const mainAccountId = mainAccountResult.rows.length > 0 ? mainAccountResult.rows[0].id : null;

        if (mainAccountId) {
          await client.query('UPDATE categories SET owner_id = $1 WHERE owner_id IS NULL', [mainAccountId]);
          await client.query('ALTER TABLE categories ALTER COLUMN owner_id SET NOT NULL');
        }

        const categories = [
          { name: 'Backend', key: 'Backend', subcategories: ['API', 'Database', 'Authentication', 'Server', 'Khác'] },
          { name: 'Frontend', key: 'Frontend', subcategories: ['UI Components', 'Icons', 'Animation', 'CSS/Styling', 'Khác'] },
          { name: 'Algorithm', key: 'Algorithm', subcategories: ['Data Structures', 'Sorting', 'Searching', 'Dynamic Programming', 'Khác'] },
          { name: 'UI / Design', key: 'UI / Design', subcategories: ['UI Components', 'Icons', 'Animation', 'Design Systems', 'Khác'] },
          { name: 'Dev Tools', key: 'Dev Tools', subcategories: ['Code Editors', 'Testing', 'Monitoring', 'Build Tools', 'Khác'] },
          { name: 'AI Tools', key: 'AI Tools', subcategories: ['Prompt Library', 'AI Image', 'AI Coding', 'AI Text', 'Khác'] },
          { name: 'Learning', key: 'Learning', subcategories: ['Tutorials', 'Courses', 'Documentation', 'Articles', 'Khác'] },
          { name: 'DevOps', key: 'DevOps', subcategories: ['Docker', 'Kubernetes', 'CI/CD', 'Infrastructure', 'Khác'] },
          { name: 'Testing', key: 'Testing', subcategories: ['Unit Testing', 'Integration Testing', 'E2E Testing', 'Performance', 'Khác'] },
          { name: 'Productivity', key: 'Productivity', subcategories: ['Project Management', 'Note Taking', 'Collaboration', 'Automation', 'Khác'] },
          { name: 'History AI', key: 'History AI', subcategories: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Khác'] },
          { name: 'TIKTOK CHANNELS', key: 'TIKTOK CHANNELS', subcategories: ['Programming', 'Design', 'Business', 'Education', 'Khác'] },
          { name: 'TikTok Photos', key: 'TikTok Photos', subcategories: ['Tips & Tricks', 'Code Snippets', 'Design Ideas', 'Tutorial', 'Khác'] },
        ];

        for (const category of categories) {
          if (!mainAccountId) continue;
          await client.query(
            `INSERT INTO categories (owner_id, name, key, subcategories) VALUES ($1, $2, $3, $4)
             ON CONFLICT (owner_id, key) DO NOTHING`,
            [mainAccountId, category.name, category.key, JSON.stringify(category.subcategories)]
          );
        }

        console.log('✅ Migration 003 completed: Created categories table and seeded default categories');
        return true;
      } catch (error) {
        console.error('❌ Migration 003 failed:', error.message);
        throw error;
      } finally {
        client.release();
      }
    },
  },
];

/**
 * Run all pending migrations
 */
const runMigrations = async () => {
  console.log('🔄 Running migrations...');
  
  for (const migration of migrations) {
    try {
      await migration.up();
    } catch (error) {
      console.error(`Failed to run migration ${migration.id}:`, error);
      throw error;
    }
  }
  
  console.log('✅ All migrations completed successfully');
};

module.exports = {
  runMigrations,
  migrations,
};
