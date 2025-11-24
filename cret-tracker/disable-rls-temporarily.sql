-- TEMPORARY FIX: Disable RLS to get the app working immediately
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/temvrzbaueyxzjgomxng/sql
-- IMPORTANT: This disables security - only use for internal department apps

-- Disable Row Level Security on all tables
ALTER TABLE associates DISABLE ROW LEVEL SECURITY;
ALTER TABLE cret_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON associates;
DROP POLICY IF EXISTS "Allow public access to associates" ON associates;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON cret_sessions;
DROP POLICY IF EXISTS "Allow public access to cret_sessions" ON cret_sessions;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow public read access to users" ON users;

-- Verification query (run this after the above)
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('associates', 'cret_sessions', 'users');
-- All should show rowsecurity = false
