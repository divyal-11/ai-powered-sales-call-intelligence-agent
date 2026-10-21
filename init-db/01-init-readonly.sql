-- Create restricted read-only role for safe NL-to-SQL & MCP queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly_user') THEN
    CREATE ROLE readonly_user WITH LOGIN PASSWORD 'readonlypassword';
  END IF;
END
$$;

-- Grant database connection
GRANT CONNECT ON DATABASE sales_intelligence TO readonly_user;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Revoke all base table permissions by default from readonly_user
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM readonly_user;

-- Set hard 3-second statement timeout directly on the role
ALTER ROLE readonly_user SET statement_timeout = '3000ms';
