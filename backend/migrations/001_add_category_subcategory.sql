-- Migration: Add category and subcategory columns to resources table
-- Run this migration to update your database schema

-- Add category column if it doesn't exist
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Add subcategory column if it doesn't exist
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_subcategory ON resources(subcategory);

-- Optional: Add constraint to enforce valid categories
-- ALTER TABLE resources 
-- ADD CONSTRAINT valid_category CHECK (category IN ('Backend', 'Frontend', 'Algorithm', 'UI / Design', 'Dev Tools', 'AI Tools', 'Learning', 'DevOps', 'Testing', 'Productivity'));
