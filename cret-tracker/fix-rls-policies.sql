-- Fix RLS Policies to Allow Anonymous Access
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/temvrzbaueyxzjgomxng/sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all for authenticated users" ON associates;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON cret_sessions;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON users;

-- Create new policies that allow anonymous (public) access
-- This is needed because we're using the anon key

-- Associates table - allow all operations for everyone
CREATE POLICY "Allow public access to associates" ON associates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- CRET Sessions table - allow all operations for everyone
CREATE POLICY "Allow public access to cret_sessions" ON cret_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users table - allow read access for everyone
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT
  USING (true);

-- Verify RLS is enabled (should already be enabled)
ALTER TABLE associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cret_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
