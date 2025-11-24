-- Diagnostic Query - Run this in Supabase SQL Editor
-- This will show you the current state of your tables and RLS

-- Check if tables exist and if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('associates', 'cret_sessions', 'users')
ORDER BY tablename;

-- Check existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('associates', 'cret_sessions', 'users')
ORDER BY tablename, policyname;
