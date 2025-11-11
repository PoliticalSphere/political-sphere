-- PostgreSQL Initialization Script for Political Sphere
-- This script runs once when the database is first created

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram matching for search

-- Create development user with appropriate permissions (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dev') THEN
    CREATE ROLE dev WITH LOGIN PASSWORD 'dev_password';
  END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE political_sphere_dev TO dev;
GRANT ALL ON SCHEMA public TO dev;

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Political Sphere database initialized successfully';
END
$$;
