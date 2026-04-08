-- Migration: Update resources table schema
-- Drop old table and recreate with new schema

DROP TABLE IF EXISTS resources CASCADE;

CREATE TABLE resources (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  technologies TEXT[] DEFAULT '{}',
  description TEXT,
  notes TEXT,
  source VARCHAR(100),
  last_used_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_resources_title ON resources USING GIN(to_tsvector('english', title));
CREATE INDEX idx_resources_description ON resources USING GIN(to_tsvector('english', description));
CREATE INDEX idx_resources_source ON resources(source);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_resources_updated_at ON resources(updated_at DESC);
