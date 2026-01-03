-- ========================================
-- Dayflow HRMS - Database Setup Script
-- ========================================
-- Run this script in pgAdmin Query Tool or psql

-- 1. Create Database
CREATE DATABASE dayflow_hrms
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE dayflow_hrms IS 'Dayflow Human Resource Management System';

-- 2. Create Database User
CREATE USER dayflow_user WITH PASSWORD 'strongpassword';

-- 3. Grant Create Database Privilege
ALTER USER dayflow_user CREATEDB;

-- 4. Grant All Privileges
GRANT ALL PRIVILEGES ON DATABASE dayflow_hrms TO dayflow_user;

-- 5. Connect to the database
\c dayflow_hrms

-- 6. Grant Schema Privileges
GRANT ALL ON SCHEMA public TO dayflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dayflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dayflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dayflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dayflow_user;

-- ========================================
-- Verification Queries
-- ========================================

-- Check if database exists
SELECT datname FROM pg_database WHERE datname = 'dayflow_hrms';
dayflow_user';

-- Check user privileges
SELECT 
    r.rolname, 
    r.rolsuper, 
    r.rolinherit,
    r.rolcreaterole, 
    r.rolcreatedb, 
    r.rolcanlogin,
    r.rolreplication
FROM pg_roles r
WHERE r.rolname = 'dayflow_user
FROM pg_roles r
WHERE r.rolname = 'odoo';

-- ========================================
-- Success Message
-- =====Database: dayflow_hrms' as database;
SELECT 'User: dayflow_user' as user;
SELECT 'Password: strongpassword' as password;
SELECT 'Next: Update .env file with connection string
SELECT 'Database setup completed successfully!' as status;
SELECT 'You can now start Odoo server with: odoo -c config/odoo.conf' as next_step;
