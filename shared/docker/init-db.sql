-- Initialize Rooster AI databases
-- This script runs when the PostgreSQL container starts for the first time

-- Create test database
CREATE DATABASE rooster_ai_test;

-- Create dedicated user for Rooster AI
CREATE USER rooster_user WITH 
    PASSWORD 'rooster_password_dev' 
    CREATEDB 
    LOGIN;

-- Grant privileges on both databases
GRANT ALL PRIVILEGES ON DATABASE rooster_ai_dev TO rooster_user;
GRANT ALL PRIVILEGES ON DATABASE rooster_ai_test TO rooster_user;

-- Connect to development database and set up schema permissions
\c rooster_ai_dev;
GRANT ALL ON SCHEMA public TO rooster_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rooster_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rooster_user;

-- Connect to test database and set up schema permissions
\c rooster_ai_test;
GRANT ALL ON SCHEMA public TO rooster_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rooster_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rooster_user;

-- Return to default database
\c rooster_ai_dev;

-- Create initial tables (optional - you can also do this via migrations later)
-- Uncomment the following if you want to create tables immediately

/*
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    company_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

-- Log successful initialization
SELECT 'Rooster AI database initialization completed successfully!' as message;
