-- Fix RLS Policies for Proper User Isolation
-- This script creates proper RLS policies that filter data by user_id
-- Since we're using Clerk for authentication, we need to rely on manual user_id filtering

-- Temporarily disable RLS to update policies
ALTER TABLE habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies
DROP POLICY IF EXISTS habits_authenticated_access ON habits;
DROP POLICY IF EXISTS habits_anon_access ON habits;
DROP POLICY IF EXISTS habit_logs_authenticated_access ON habit_logs;
DROP POLICY IF EXISTS habit_logs_anon_access ON habit_logs;
DROP POLICY IF EXISTS todos_authenticated_access ON todos;
DROP POLICY IF EXISTS todos_anon_access ON todos;
DROP POLICY IF EXISTS timer_settings_authenticated_access ON timer_settings;
DROP POLICY IF EXISTS timer_settings_anon_access ON timer_settings;

-- Re-enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings ENABLE ROW LEVEL SECURITY;

-- Create proper policies that filter by user_id with bypass for service role
-- These policies allow access when using service role key (for server-side operations)
-- or when the user_id matches (for client-side operations with proper filtering)

-- Habits policies
CREATE POLICY habits_user_isolation ON habits
  FOR ALL
  USING (
    current_setting('role') = 'service_role' OR 
    user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('role') = 'service_role' OR 
    user_id = current_setting('app.current_user_id', true)
  );

-- Habit logs policies - check through habit ownership
CREATE POLICY habit_logs_user_isolation ON habit_logs
  FOR ALL
  USING (
    current_setting('role') = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM habits h 
      WHERE h.id = habit_logs.habit_id 
      AND h.user_id = current_setting('app.current_user_id', true)
    )
  )
  WITH CHECK (
    current_setting('role') = 'service_role' OR 
    EXISTS (
      SELECT 1 FROM habits h 
      WHERE h.id = habit_logs.habit_id 
      AND h.user_id = current_setting('app.current_user_id', true)
    )
  );

-- Todos policies
CREATE POLICY todos_user_isolation ON todos
  FOR ALL
  USING (
    current_setting('role') = 'service_role' OR 
    user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('role') = 'service_role' OR 
    user_id = current_setting('app.current_user_id', true)
  );

-- Timer settings policies
CREATE POLICY timer_settings_user_isolation ON timer_settings
  FOR ALL
  USING (
    current_setting('role') = 'service_role' OR 
    user_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    current_setting('role') = 'service_role' OR 
    user_id = current_setting('app.current_user_id', true)
  );

-- Note: 
-- 1. The application must set current_setting('app.current_user_id') before making queries
-- 2. Service role bypasses these restrictions for server-side operations
-- 3. All client queries MUST include explicit user_id filtering as additional security 